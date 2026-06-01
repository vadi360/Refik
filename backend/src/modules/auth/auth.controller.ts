// ============================================================================
// Auth Controller (auth.controller.ts)
// Açıklama: Auth endpoint'lerini tanımlar
// 
// Bu controller:
// 1. Kimlik doğrulama endpoint'lerini tanımlar
// 2. Swagger dokümantasyonu için decorators ekler
// 3. Request/Response validation'ı yönetir
// 
// Endpoint'ler:
// - POST /api/v1/auth/register - Kayıt ol
// - POST /api/v1/auth/login - Giriş yap
// - POST /api/v1/auth/logout - Çıkış yap
// - POST /api/v1/auth/refresh - Token yenile
// - POST /api/v1/auth/forgot-password - Şifre unuttum
// - POST /api/v1/auth/verify-otp - OTP doğrula
// ============================================================================

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Current request tipi - user bilgisine erişmek için
interface RequestWithUser extends Request {
  user: { userId: string; email: string };
}

@ApiTags('Auth') // Swagger'da "Auth" kategorisinde göster
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Kullanıcı Kaydı
   * 
   * Yeni avukat kaydı oluşturur
   * Başarılı kayıtta JWT token'ları döndürür
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kayıt', description: 'Yeni bir avukat hesabı oluşturur' })
  @ApiResponse({
    status: 201,
    description: 'Kayıt başarılı',
    schema: {
      example: {
        user: { id: 'uuid', email: 'john@example.com', name: 'John Doe' },
        accessToken: 'eyJ...',
        refreshToken: 'eyJ...',
        tokenType: 'Bearer',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email veya telefon zaten kullanılıyor' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Kullanıcı Girişi
   * 
   * Email ve şifre ile giriş yapar
   * Başarılı girişte JWT token'ları döndürür
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Giriş yap', description: 'Email ve şifre ile giriş yapar' })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı',
    schema: {
      example: {
        user: { id: 'uuid', email: 'john@example.com', name: 'John Doe', subscriptionStatus: 'free' },
        accessToken: 'eyJ...',
        refreshToken: 'eyJ...',
        tokenType: 'Bearer',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Geçersiz email veya şifre' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Token Yenileme
   * 
   * Refresh token ile yeni access token üretir
   * Header'da eski refresh token gönderilmelidir
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Token yenile', description: 'Refresh token ile yeni access token üretir' })
  @ApiResponse({ status: 200, description: 'Token yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş refresh token' })
  async refresh(@Body() body: { refreshToken: string }) {
    // Token'dan user ID çıkarılır (jwt.strategy'de req.user'a eklenir)
    // Bu controller'da direkt olarak payload'dan çıkarıyoruz
    const decoded = this.authService.decodeRefreshToken(body.refreshToken);
    return this.authService.refreshToken(decoded.sub, body.refreshToken);
  }

  /**
   * Şifre Unuttum
   * 
   * Email adresine şifre sıfırlama bağlantısı gönderir
   * Email mevcut değilse de aynı mesaj döner (email enumeration önleme)
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Şifre unuttum', description: 'Şifre sıfırlama email\'i gönderir' })
  @ApiResponse({ status: 200, description: 'Şifre sıfırlama talimatları gönderildi' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * OTP Doğrulama
   * 
   * Telefon numarasına gönderilen 6 haneli OTP kodunu doğrular
   * Başarılı doğrulamada telefon "doğrulanmış" olarak işaretlenir
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OTP doğrula', description: 'Telefon OTP kodunu doğrular' })
  @ApiResponse({ status: 200, description: 'Doğrulama başarılı' })
  @ApiResponse({ status: 400, description: 'Geçersiz OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * Çıkış
   * 
   * Kullanıcının oturumunu sonlandırır
   * Access token'ın header'da gönderilmesi gerekir
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard) // Korumalı endpoint - token gerekli
  @ApiBearerAuth() // Swagger'da "Authorization: Bearer xxx" göster
  @ApiOperation({ summary: 'Çıkış yap', description: 'Oturumu sonlandırır' })
  @ApiResponse({ status: 200, description: 'Çıkış başarılı' })
  async logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user.userId);
  }
}