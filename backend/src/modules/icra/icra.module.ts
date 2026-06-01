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
import { AiModule } from '../ai/ai.module';
import { RemindersModule } from '../reminders/reminders.module';
import { IcraController } from './icra.controller';
import { IcraService } from './icra.service';
import { BulkIcraService } from './services/bulk-icra.service';
import { AssetDetectionService } from './services/asset-detection.service';
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
    AiModule,
    NotificationsModule,
    RemindersModule,
  ],
  controllers: [IcraController],
  providers: [
    IcraService,
    BulkIcraService,
    AssetDetectionService,
    JwtAuthGuard,
  ],
  exports: [IcraService, BulkIcraService, AssetDetectionService],
})
export class IcraModule {}