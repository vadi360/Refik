// ============================================================================
// Ödeme Modülü (payments.module.ts)
// Açıklama: Ödeme işlemleri modülü
// 
// Bu modül:
// 1. Üç ödeme sağlayıcısını destekler (iyzico, PayTR, Stripe)
// 2. Admin panelden seçilen sağlayıcıyı kullanır
// 3. Abonelik ve token paketi ödemelerini yönetir
// 
// Admin Panel Entegrasyonu:
// - Admin panelden "Ödeme Sağlayıcısı" seçilir (iyzico/paytr/stripe)
// - Seçim veritabanında saklanır (ai_config tablosu)
// - Tüm ödemeler admin seçimine göre yönlendirilir
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { IyzicoProvider } from './providers/iyzico.provider';
import { PaytrProvider } from './providers/paytr.provider';
import { StripeProvider } from './providers/stripe.provider';
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
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    IyzicoProvider,
    PaytrProvider,
    StripeProvider,
    JwtAuthGuard,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}