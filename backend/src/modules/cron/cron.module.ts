// ============================================================================
// Cron Modülü (cron.module.ts)
// Açıklama: Zamanlanmış görevler (background jobs) modülü
// 
// Bu modül:
// 1. UETS tebligatlarını periyodik olarak kontrol eder (15 dk)
// 2. 5 gün kuralına uyan tebligatları otomatik işler
// 3. Süresi yaklaşan hatırlatıcıları kontrol eder
// 4. Tamamlanmamış tevkillerin süresini kontrol eder
// 
// Kullanılan Teknoloji:
// - NestJS ScheduleModule (@nestjs/schedule)
// - Bull Queue (@nestjs/bull) - daha ağır işler için
// ============================================================================
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { UetsService } from '../uets/uets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';
import { RemindersService } from '../reminders/reminders.service';
import { CronService } from './cron.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Zamanlanmış görevler için
    ScheduleModule.forRoot(),
    
    // Bull Queue - ağır işler için (email, SMS, vb.)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // JWT
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    
    // Diğer modüller
    PrismaModule,
    UetsService,
    NotificationsService,
    AiService,
    RemindersService,
  ],
  providers: [CronService, JwtAuthGuard],
  exports: [CronService],
})
export class CronModule {}