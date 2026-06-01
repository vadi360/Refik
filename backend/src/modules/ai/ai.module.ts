// ============================================================================
// AI Modülü (ai.module.ts)
// Açıklama: Yapay zeka işlemleri modülü
// 
// Bu modül:
// 1. AI modelleri arasında yönlendirme yapar (Minimax / Claude)
// 2. Admin panelden yapılandırılan kurallara göre AI seçimi yapar
// 3. Şu AI görevlerini gerçekleştirir:
//    - notification_summary: Tebligat özetleme
//    - deadline_extract: Süre çıkarımı
//    - case_summary: Dosya özeti
//    - decision_analysis: Karar analizi (aleyhe/lehe)
//    - document_generate: Dilekçe üretimi
//    - document_revise: Dilekçe revizyonu
//    - legal_notice: İhtarname üretimi
//    - legal_research: İçtihat araştırması
//    - general_qa: Genel soru-cevap
// 
// AI Model Seçimi:
// - Her görev için hangi AI'ın kullanılacağı veritabanında (ai_config tablosu) saklanır
// - Admin panelden değiştirilebilir
// - Varsayılan: Minimax (hızlı ve düşük maliyetli)
// - Kritik görevler (içtihat, karar analizi): Claude
// 
// Endpoint'ler:
// - POST /api/v1/ai/summarize - Özetle
// - POST /api/v1/ai/deadline-extract - Süre çıkar
// - POST /api/v1/ai/case-summary - Dosya özeti
// - POST /api/v1/ai/document-generate - Dilekçe üret
// - POST /api/v1/ai/document-revise - Dilekçe revize
// - POST /api/v1/ai/legal-research - İçtihat ara
// - POST /api/v1/ai/analyze-decision - Karar analiz et
// - POST /api/v1/ai/chat - Genel Q&A
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MinimaxProvider } from './providers/minimax.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * AI modülü yapılandırması
 * 
 * AI providers (Minimax, Claude) ve controller/service içerir
 * Routing, hangi provider'ın hangi görev için kullanılacağını belirler
 */
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
  controllers: [AiController],
  providers: [
    AiService, // AI işlemleri servisi - yönlendirme mantığı burada
    MinimaxProvider, // Minimax M2.7 API provider'ı
    ClaudeProvider, // Claude API provider'ı
    JwtAuthGuard, // Korumalı endpoint'ler için
  ],
  exports: [AiService],
})
export class AiModule {}