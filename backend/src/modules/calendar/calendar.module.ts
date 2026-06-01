// ============================================================================
// Takvim Modülü (calendar.module.ts)
// Açıklama: Takvim modülü
// 
// Bu modül:
// 1. Tüm takvim verilerini birleştirir (duruşma, hatırlatıcı, tebligat, icra)
// 2. Günlük/haftalık/aylık görünüm için optimize edilmiş endpoint'ler sunar
// 3. Takvim item'larının CRUD işlemlerini yönetir
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
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
  controllers: [CalendarController],
  providers: [CalendarService, JwtAuthGuard],
  exports: [CalendarService],
})
export class CalendarModule {}