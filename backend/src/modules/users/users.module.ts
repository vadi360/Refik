// ============================================================================
// Users Modülü (users.module.ts)
// Açıklama: Kullanıcı/profil işlemleri modülü
// 
// Bu modül:
// 1. Kullanıcı profil bilgilerini getirir/günceller
// 2. Avukat arama işlevini sağlar
// 3. Kullanıcı avatar'ını günceller
// 4. Şifre değiştirme işlemini yönetir
// 
// Endpoint'ler:
// - GET /api/v1/users/profile - Profil bilgileri
// - PUT /api/v1/users/profile - Profil güncelle
// - PUT /api/v1/users/password - Şifre değiştir
// - GET /api/v1/users/:id - Kullanıcı profil (herkes)
// - GET /api/v1/users/search - Avukat ara
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Users modülü yapılandırması
 * 
 * Profil ve kullanıcı işlemleri için
 */
@Module({
  imports: [
    // JWT modülü - token doğrulama için gerekli
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService, // Kullanıcı işlemleri servisi
    JwtAuthGuard, // Korumalı endpoint'ler için
  ],
  exports: [UsersService],
})
export class UsersModule {}