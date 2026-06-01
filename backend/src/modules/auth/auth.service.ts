// ============================================================================
// Auth Servisi (auth.service.ts)
// Açıklama: Kimlik doğrulama işlemlerinin ana servis dosyası
// 
// Bu servis:
// 1. Kullanıcı kaydı oluşturur (email, password, name, phone)
// 2. Kullanıcı girişini doğrular ve JWT token üretir
// 3. Token yenileme işlemini yönetir (refresh token)
// 4. Şifre sıfırlama isteği oluşturur
// 5. OTP doğrulaması yapar
// 6. Kullanıcı çıkış işlemini yönetir
// 
// Güvenlik Notları:
// - Şifreler bcrypt ile hashlenerek saklanır (10 round)
// - JWT access token 1 saat geçerli
// - JWT refresh token 7 gün geçerli
// - Her işlem denetim kaydı (audit log) olarak saklanır
// ============================================================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

// Bcrypt hash round sayısı - güvenlik ve performans dengesi
// Değer arttıkça hash daha güvenli ama daha yavaş
// Production için 12-14 arası önerilir
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    // Prisma ile veritabanı işlemleri için
    private prisma: PrismaService,
    // JWT token üretimi için
    private jwtService: JwtService,
    // Environment değişkenleri için
    private configService: ConfigService,
  ) {}

  /**
   * Kullanıcı Kaydı (Register)
   * 
   * Yeni bir avukat kullanıcı hesabı oluşturur
   * Email ve telefon benzersiz olmalıdır
   * 
   * @param registerDto - Kayıt bilgileri (name, email, phone, password)
   * @returns Kayıt olan kullanıcı bilgileri ve JWT token'ları
   * 
   * @throws ConflictException - Email veya telefon zaten kullanılıyorsa
   */
  async register(registerDto: RegisterDto) {
    const { email, phone, password, name, kvkkConsent } = registerDto;

    // -----------------------------------------------------------------------------
    // EMAIL KONTROLÜ
    // -----------------------------------------------------------------------------
    // Email'in veritabanında daha önce kaydedilip edilmediğini kontrol et
    // Varsa ConflictException fırlat
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException(
        'Bu e-posta adresi zaten kullanılmaktadır. Lütfen farklı bir e-posta deneyin veya giriş yapın.',
      );
    }

    // -----------------------------------------------------------------------------
    // TELEFON KONTROLÜ (opsiyonel)
    // -----------------------------------------------------------------------------
    // Telefon numarası verildiyse, benzersiz olup olmadığını kontrol et
    // Telefon zorunlu değil, bu yüzden sadece verildiğinde kontrol et
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException(
          'Bu telefon numarası zaten kullanılmaktadır. Lütfen farklı bir numara deneyin.',
        );
      }
    }

    // -----------------------------------------------------------------------------
    // ŞİFRE HASHLEME
    // -----------------------------------------------------------------------------
    // Kullanıcının girdiği şifreyi bcrypt ile hash'le
    // Bu, veritabanına düz şifre kaydedilmemesini sağlar
    // hash() fonksiyonu her seferinde farklı bir hash üretir (salt ile)
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // -----------------------------------------------------------------------------
    // KULLANICI OLUŞTURMA
    // -----------------------------------------------------------------------------
    // Prisma ile yeni kullanıcıyı veritabanına kaydet
    const user = await this.prisma.user.create({
      data: {
        email, // E-posta adresi
        passwordHash, // Hashlenmiş şifre
        name, // Ad soyad
        phone, // Telefon (opsiyonel)
        phoneVerified: false, // Başlangıçta doğrulanmamış
        subscriptionStatus: 'free', // Başlangıçta free paket
        // KVKK ve Claude rızası
        kvkkConsent: kvkkConsent || false,
        kvkkConsentAt: kvkkConsent ? new Date() : null,
        claudeConsent: false,
      },
      // Password hash'i döndürülmeyecek (güvenlik)
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    // -----------------------------------------------------------------------------
    // JWT TOKEN ÜRETİMİ
    // -----------------------------------------------------------------------------
    // Kullanıcı oluşturulduktan sonra JWT token'larını üret
    const tokens = await this.generateTokens(user.id, user.email);

    // -----------------------------------------------------------------------------
    // AUDIT LOG KAYDI
    // -----------------------------------------------------------------------------
    // Kayıt işlemini denetim kaydı olarak sakla
    // Bu, sistemdeki tüm önemli işlemlerin takibini sağlar
    await this.createAuditLog({
      userId: user.id,
      action: 'USER_REGISTER',
      entityType: 'users',
      entityId: user.id,
      newValue: { email: user.email, name: user.name },
    });

    // -----------------------------------------------------------------------------
    // DÖNÜŞ
    // -----------------------------------------------------------------------------
    // Kullanıcı bilgilerini ve token'ları döndür
    return {
      user, // Kullanıcı bilgileri (şifre hariç)
      ...tokens, // Access ve refresh token'lar
    };
  }

  /**
   * Kullanıcı Girişi (Login)
   * 
   * Email ve şifre ile giriş yapar
   * Başarılı girişte JWT token'ları döndürür
   * 
   * @param loginDto - Giriş bilgileri (email, password)
   * @returns Kullanıcı bilgileri ve JWT token'ları
   * 
   * @throws UnauthorizedException - Geçersiz email veya şifre ise
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // -----------------------------------------------------------------------------
    // KULLANICI BULMA
    // -----------------------------------------------------------------------------
    // Email ile kullanıcıyı veritabanında bul
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Kullanıcı yoksa veya silinmişse hata ver
    if (!user || user.deletedAt) {
      throw new UnauthorizedException(
        'Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol edin.',
      );
    }

    // -----------------------------------------------------------------------------
    // ŞİFRE DOĞRULAMA
    // -----------------------------------------------------------------------------
    // Girilen şifreyi, veritabanındaki hash ile karşılaştır
    // compare() fonksiyonu bcrypt'in hash'i çözmesini sağlar
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    // Şifre yanlışsa hata ver
    if (!isPasswordValid) {
      // Farklı bir hata mesajı kullan (security through obscurity)
      // Email'in varlığı hakkında bilgi leak etmemek için
      throw new UnauthorizedException(
        'Geçersiz e-posta veya şifre. Lütfen bilgilerinizi kontrol edin.',
      );
    }

    // -----------------------------------------------------------------------------
    // JWT TOKEN ÜRETİMİ
    // -----------------------------------------------------------------------------
    // Giriş başarılı, JWT token'larını üret
    const tokens = await this.generateTokens(user.id, user.email);

    // -----------------------------------------------------------------------------
    // AUDIT LOG KAYDI
    // -----------------------------------------------------------------------------
    // Giriş işlemini kaydet
    await this.createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'users',
      entityId: user.id,
    });

    // -----------------------------------------------------------------------------
    // DÖNÜŞ
    // -----------------------------------------------------------------------------
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
      },
      ...tokens,
    };
  }

  /**
   * Token Yenileme (Refresh)
   * 
   * Refresh token ile yeni access token üretir
   * Refresh token süresi dolmadıysa geçerlidir
   * 
   * @param userId - Kullanıcı ID'si
   * @param refreshToken - Geçerli refresh token
   * @returns Yeni access ve refresh token'lar
   */
  async refreshToken(userId: string, refreshToken: string) {
    // -----------------------------------------------------------------------------
    // TOKEN DOĞRULAMA
    // -----------------------------------------------------------------------------
    // Refresh token'ın geçerli olup olmadığını kontrol et
    // Geçersizse UnauthorizedException fırlat
    try {
      // JWTService'in verify() metodu token'ın geçerliliğini kontrol eder
      // Token'ın imzası ve süresi doğrulanır
      const payload = this.jwtService.verify(refreshToken, {
        // Refresh token secret'ını kullan (access token secret'ından farklı)
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Token'daki userId ile verilen userId'nin eşleştiğini kontrol et
      if (payload.sub !== userId) {
        throw new UnauthorizedException('Geçersiz refresh token');
      }
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.',
      );
    }

    // -----------------------------------------------------------------------------
    // KULLANICI KONTROLÜ
    // -----------------------------------------------------------------------------
    // Kullanıcının hâlâ aktif olup olmadığını kontrol et
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya silinmiş');
    }

    // -----------------------------------------------------------------------------
    // YENİ TOKEN ÜRETİMİ
    // -----------------------------------------------------------------------------
    const tokens = await this.generateTokens(user.id, user.email);

    // -----------------------------------------------------------------------------
    // DÖNÜŞ
    // -----------------------------------------------------------------------------
    return tokens;
  }

  /**
   * Şifre Unuttum (Forgot Password)
   * 
   * Kullanıcının email adresine şifre sıfırlama bağlantısı gönderir
   * Şimdilik sadece dummy implementasyon - email gönderimi sonra eklenecek
   * 
   * @param forgotPasswordDto - Email bilgisi
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // -----------------------------------------------------------------------------
    // KULLANICI KONTROLÜ
    // -----------------------------------------------------------------------------
    // Email'in veritabanında olup olmadığını kontrol et
    // Varsa şifre sıfırlama email'i gönder
    // Yoksa da hata verme (email enumeration önlemek için)
    // Kullanıcıya her zaman "Email gönderildi" mesajı göster
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Email gönderimi simülasyonu
    // TODO: Gerçek email gönderimi (SendGrid) sonra eklenecek
    if (user) {
      console.log(`[TODO] Şifre sıfırlama email'i gönderilecek: ${email}`);
      // await this.sendPasswordResetEmail(user);
    }

    // Her durumda aynı mesajı döndür (security)
    return {
      message:
        'Şifre sıfırlama talimatları e-posta adresinize gönderildi (varsa).',
    };
  }

  /**
   * OTP Doğrulama
   * 
   * Telefon numarasına gönderilen OTP kodunu doğrular
   * Şimdilik dummy implementasyon - gerçek OTP servisi sonra eklenecek
   * 
   * @param verifyOtpDto - OTP kodu ve telefon bilgisi
   * @returns Doğrulama başarılıysa kullanıcı bilgileri
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp } = verifyOtpDto;

    // TODO: Gerçek OTP doğrulama servisi eklenecek
    // Şimdilik herhangi bir 6 haneli kod kabul edilsin (demo için)
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw new BadRequestException('Geçersiz OTP formatı. 6 haneli rakam giriniz.');
    }

    // -----------------------------------------------------------------------------
    // KULLANICI BULMA VE GÜNCELLEME
    // -----------------------------------------------------------------------------
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new BadRequestException('Bu telefon numarasına kayıtlı kullanıcı bulunamadı.');
    }

    // Telefonu doğrulanmış olarak işaretle
    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });

    // Audit log
    await this.createAuditLog({
      userId: user.id,
      action: 'PHONE_VERIFIED',
      entityType: 'users',
      entityId: user.id,
    });

    return {
      message: 'Telefon numaranız başarıyla doğrulandı.',
      user: {
        id: user.id,
        phone: user.phone,
        phoneVerified: true,
      },
    };
  }

  /**
   * Çıkış (Logout)
   * 
   * Kullanıcının oturumunu sonlandırır
   * Şimdilik dummy implementasyon - gerçek logout sonra eklenecek
   * Gerçek implementasyonda refresh token'ın blacklist'e eklenmesi gerekir
   * 
   * @param userId - Çıkış yapan kullanıcı ID'si
   */
  async logout(userId: string) {
    // Audit log
    await this.createAuditLog({
      userId,
      action: 'USER_LOGOUT',
      entityType: 'users',
      entityId: userId,
    });

    // TODO: Refresh token'ı blacklist'e ekle (Redis kullanarak)
    // await this.addToBlacklist(refreshToken);

    return { message: 'Başarıyla çıkış yapıldı.' };
  }

  // ============================================================================
  // YARDIMCI METODLAR
  // ============================================================================

  /**
   * JWT Token Üretimi
   * 
   * Access token ve refresh token üretir
   * Access token: 1 saat geçerli, kullanıcı bilgilerini içerir
   * Refresh token: 7 gün geçerli, sadece user ID içerir
   * 
   * @param userId - Kullanıcı ID'si
   * @param email - Kullanıcı email'i
   * @returns Access token, refresh token ve token tipi
   */
  private async generateTokens(userId: string, email: string) {
    // Access Token payload
    // Bu bilgiler token decode edildiğinde görülebilir
    // Hassas bilgiler (şifre, vs.) eklenmemeli
    const accessPayload = {
      sub: userId, // Subject - kullanıcı ID
      email: email, // Kullanıcı email'i
      type: 'access', // Token tipi
    };

    // Refresh Token payload
    // Sadece user ID'yi içerir - minimum bilgi
    const refreshPayload = {
      sub: userId,
      type: 'refresh',
    };

    // Access token üret
    const accessToken = this.jwtService.sign(accessPayload, {
      // Access token için 1 saat
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    });

    // Refresh token üret
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'), // Farklı secret kullan
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'), // 7 gün
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer', // HTTP Authorization header formatı
      expiresIn: 3600, // Access token süresi (saniye)
    };
  }

  /**
   * Denetim Kaydı Oluşturma (Audit Log)
   * 
   * Sisteme yapılan önemli işlemleri kaydeder
   * Kullanıcı kimliği, işlem tipi, etkilenen kayıtlar gibi bilgileri saklar
   * 
   * @param params - Audit log parametreleri
   */
  private async createAuditLog(params: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
  }) {
    try {
      // Audit log'u veritabanına kaydet
      // Bu, sistemdeki tüm önemli işlemlerin takibini sağlar
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
          newValue: params.newValue ? JSON.stringify(params.newValue) : null,
          // IP ve user agent - şimdilik null (middleware sonra eklenecek)
          ipAddress: null,
          userAgent: null,
        },
      });
    } catch (error) {
      // Audit log hatası uygulamayı durdurmamalı
      // Sadece console'da logla
      console.error('Audit log oluşturulamadı:', error);
    }
  }
}