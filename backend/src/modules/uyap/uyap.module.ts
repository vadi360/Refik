// ============================================================================
// UYAP Modülü (uyap.module.ts)
// Açıklama: UYAP entegrasyon modülü
// 
// Bu modül:
// 1. Chrome eklentisinden gelen verileri işler
// 2. Dava ve belge bilgilerini veritabanına kaydeder
// 3. RAG entegrasyonu ile belgeleri otomatik indeksler
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UyapController } from './uyap.controller';
import { UyapService } from './services/uyap.service';
import { RagModule } from '../rag/rag.module';
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
    RagModule,
  ],
  controllers: [UyapController],
  providers: [UyapService, JwtAuthGuard],
  exports: [UyapService],
})
export class UyapModule {}