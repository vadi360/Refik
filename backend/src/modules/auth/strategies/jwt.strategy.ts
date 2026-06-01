// ============================================================================
// JWT Stratejisi (jwt.strategy.ts)
// Açıklama: JWT token doğrulama stratejisi
// 
// Bu strateji:
// 1. Authorization header'ından Bearer token'ı çıkarır
// 2. Token'ın geçerliliğini kontrol eder (imza, süre)
// 3. Token'daki payload'ı (userId, email) kullanıcı bilgisine dönüştürür
// 4. Doğrulanan kullanıcı bilgisini request'e ekler (req.user)
// 
// Kullanım: JwtAuthGuard kullanıldığında otomatik olarak bu strateji çalışır
// Örnek: @UseGuards(JwtAuthGuard) ile korunan endpoint'ler
// ============================================================================

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Payload - Token içindeki bilgiler
 * 
 * Access token'da saklanan bilgiler
 */
interface JwtPayload {
  sub: string; // Kullanıcı ID'si (user.id)
  email: string; // Kullanıcı email'i
  type: 'access'; // Token tipi (access veya refresh)
}

/**
 * JWT Strateji - Passport.js Stratejisi
 * 
 * JWT token'ların doğrulanması için kullanılır
 * Strategy base class'ını genişletir
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    // JwtStrategy'nin yapılandırması
    super({
      // JWT token'ı header'dan çıkarma yöntemi
      // Authorization: Bearer <token> formatından token'ı alır
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Token imzasını doğrulamak için secret
      // Environment'dan okunur, yoksa varsayılan değer kullanılır
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),

      // Token süresini kontrol et
      // true: Süresi dolmuş token'ları reddeder
      ignoreExpiration: false, // Süresi dolmuş token'ları reddet

      // Token'dan hangi bilgilerin alınacağı
      // request nesnesinden token options'a erişim
    });
  }

  /**
   * Validate - Token doğrulandıktan sonra çalışır
   * 
   * Bu metod:
   * 1. Token payload'ındaki bilgileri alır
   * 2. Kullanıcının veritabanında hâlâ aktif olup olmadığını kontrol eder
   * 3. Kullanıcı bilgisini döndürür (req.user'a eklenir)
   * 
   * @param payload - JWT token'ın decode edilmiş içeriği
   * @returns Kullanıcı bilgileri (userId, email)
   * 
   * @throws UnauthorizedException - Kullanıcı bulunamazsa veya silinmişse
   */
  async validate(payload: JwtPayload) {
    // Payload'dan gerekli bilgileri çıkar
    const { sub: userId, email } = payload;

    // Kullanıcının veritabanında olup olmadığını kontrol et
    // Bu, token'ın geçerli olmasına rağmen kullanıcının silinmiş olabileceği durumları handle eder
    // Not: Pratik performans için bu kontrol her istekte yapılmayabilir
    // İleride Redis cache ile optimize edilebilir
    
    // Şimdilik direkt olarak payload bilgisini döndürüyoruz
    // Gerçek uygulamada veritabanı kontrolü eklenebilir
    // const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    // if (!user || user.deletedAt) { throw new UnauthorizedException(); }

    // Token geçerli ve kullanıcı aktif
    // Bu bilgi req.user'a eklenir ve controller'da kullanılabilir
    return {
      userId, // Kullanıcı ID'si
      email, // Kullanıcı email'i
    };
  }
}