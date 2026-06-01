// ============================================================================
// Auth Modülü (auth.module.ts)
// Açıklama: Kimlik doğrulama işlemleri modülü
// 
// Bu modül:
// 1. Kullanıcı kayıt (register) işlemini yönetir
// 2. Kullanıcı giriş (login) işlemini yönetir
// 3. JWT token üretimi ve doğrulaması yapar
// 4. Şifre sıfırlama işlemlerini yönetir
// 5. OTP doğrulaması yapar
// 
// Endpoint'ler:
// - POST /api/v1/auth/register - Yeni kullanıcı kaydı
// - POST /api/v1/auth/login - Giriş
// - POST /api/v1/auth/logout - Çıkış
// - POST /api/v1/auth/refresh - Token yenile
// - POST /api/v1/auth/forgot-password - Şifre unuttum
// - POST /api/v1/auth/verify-otp - OTP doğrulama
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalStrategy } from './strategies/local.strategy';

/**
 * Auth modülü yapılandırması
 * 
 * JwtModule: JWT token üretimi ve doğrulaması için
 * PassportModule: Kimlik doğrulama stratejileri için
 */
@Module({
  // Passport'ı import et - local ve jwt stratejileri için gerekli
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT modülü - token üretimi için
    JwtModule.registerAsync({
      inject: [ConfigService], // ConfigService'i inject et
      useFactory: (config: ConfigService) => ({
        // JWT signing secret - güvenli bir şekilde saklanmalı (environment'dan okunur)
        secret: config.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
        
        // Token süresi - 1 saat (3600000 ms)
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
  ],
  
  // Modül içinde kullanılacak controller ve service'ler
  controllers: [AuthController],
  providers: [
    AuthService, // Auth işlemleri servisi
    JwtStrategy, // JWT doğrulama stratejisi
    LocalStrategy, // Local (email/password) doğrulama stratejisi
    JwtAuthGuard, // JWT guard - endpoint'leri korumak için
  ],
  
  // Diğer modüllerin erişmesi için export'lar
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}