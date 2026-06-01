// ============================================================================
// Kullanıcı Evrakları Modülü (user-documents.module.ts)
// Açıklama: Kullanıcı evrakları (özlük dosyası) modülü
// 
// Bu modül:
// 1. Avukatların kimlik, baro belgesi, vergi levhası gibi evraklarını saklar
// 2. Admin onay sürecini yönetir
// 3. Belge doğrulama işlemlerini gerçekleştirir
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UserDocumentsController } from './user-documents.controller';
import { UserDocumentsService } from './user-documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    PrismaModule,
  ],
  controllers: [UserDocumentsController],
  providers: [UserDocumentsService, JwtAuthGuard],
  exports: [UserDocumentsService],
})
export class UserDocumentsModule {}