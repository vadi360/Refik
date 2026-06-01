// ============================================================================
// Notifications Modülü (notifications.module.ts)
// Açıklama: Tebligat işlemleri modülü
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service'; // Tebligat işlemleri
import { NotificationService } from './notification.service'; // Çoklu kanal bildirim servisi
import { FcmService } from './services/fcm.service';
import { NetgsmService } from './services/netgsm.service';
import { SendgridService } from './services/sendgrid.service';
import { WhatsAppService } from './services/whatsapp.service';
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
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationService,
    FcmService,
    NetgsmService,
    SendgridService,
    WhatsAppService,
    JwtAuthGuard,
  ],
  exports: [NotificationsService, NotificationService],
})
export class NotificationsModule {}