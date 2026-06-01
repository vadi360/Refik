// ============================================================================
// İcra Modülü (icra.module.ts)
// Açıklama: İcra takip modülü
// 
// Bu modül:
// 1. İcra takip numarası ile dosya takibi
// 2. UYAP icra modülü entegrasyonu
// 3. Otomatik hatırlatıcı ve bildirim
// 4. AI analiz
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RemindersModule } from '../reminders/reminders.module';
import { IcraController } from './icra.controller';
import { IcraService } from './icra.service';
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
    NotificationsModule,
    RemindersModule,
  ],
  controllers: [IcraController],
  providers: [IcraService, JwtAuthGuard],
  exports: [IcraService],
})
export class IcraModule {}