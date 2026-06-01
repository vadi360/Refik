// ============================================================================
// AI Controller (ai.controller.ts)
// Açıklama: AI endpoint'leri
// 
// Bu controller:
// 1. AI işlemleri için endpoint'leri tanımlar
// 2. Her görev türü için ayrı endpoint sağlar
// 3. Swagger dokümantasyonu ekler
// 
// Endpoint'ler:
// - POST /api/v1/ai/summarize - Tebligat özetleme
// - POST /api/v1/ai/deadline-extract - Süre çıkarımı
// - POST /api/v1/ai/case-summary - Dosya özeti
// - POST /api/v1/ai/document-generate - Dilekçe üretimi
// - POST /api/v1/ai/document-revise - Dilekçe revizyonu
// - POST /api/v1/ai/legal-research - İçtihat araştırması
// - POST /api/v1/ai/analyze-decision - Karar analizi
// - POST /api/v1/ai/chat - Genel Q&A
// ============================================================================

import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('summarize')
  @ApiOperation({ summary: 'Tebligat özetle', description: 'UETS tebligat metnini özetler ve kritik bilgileri çıkarır' })
  async summarize(@Body() body: { text: string }, @Req() req: any) {
    return this.aiService.summarizeNotification(body.text, req.user.userId);
  }

  @Post('deadline-extract')
  @ApiOperation({ summary: 'Süre çıkar', description: 'Tebligat veya karar metninden süre bilgisini çıkarır' })
  async extractDeadline(@Body() body: { text: string }, @Req() req: any) {
    return this.aiService.extractDeadline(body.text, req.user.userId);
  }

  @Post('case-summary')
  @ApiOperation({ summary: 'Dosya özeti', description: 'Bir davanın tüm bilgilerini özetler' })
  async caseSummary(@Body() body: { caseId: string }, @Req() req: any) {
    return this.aiService.summarizeCase(body.caseId, req.user.userId);
  }

  @Post('document-generate')
  @ApiOperation({ summary: 'Dilekçe üret', description: 'Verilen bilgilerle dilekçe veya ihtarname üretir' })
  async documentGenerate(
    @Body()
    body: {
      type: 'petition' | 'legal_notice' | 'other';
      caseId?: string;
      details: Record<string, any>;
      style?: 'formal' | 'semi-formal';
    },
    @Req() req: any,
  ) {
    return this.aiService.generateDocument(body, req.user.userId);
  }

  @Post('document-revise')
  @ApiOperation({ summary: 'Dilekçe revize et', description: 'Mevcut bir dilekçeyi revize eder' })
  async documentRevise(
    @Body() body: { documentId: string; revisionRequest: string },
    @Req() req: any,
  ) {
    return this.aiService.reviseDocument(body.documentId, body.revisionRequest, req.user.userId);
  }

  @Post('legal-research')
  @ApiOperation({ summary: 'İçtihat ara', description: 'Verilen konuda içtihat ve emsal karar araştırır' })
  async legalResearch(@Body() body: { query: string }, @Req() req: any) {
    return this.aiService.legalResearch(body.query, req.user.userId);
  }

  @Post('analyze-decision')
  @ApiOperation({ summary: 'Karar analiz et', description: 'Mahkeme kararının lehte/aleyhte olduğunu analiz eder' })
  async analyzeDecision(@Body() body: { text: string }, @Req() req: any) {
    return this.aiService.analyzeDecision(body.text, req.user.userId);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Genel soru', description: 'Hukuki sorularınızı sorun' })
  async chat(@Body() body: { question: string }, @Req() req: any) {
    return this.aiService.chat(body.question, req.user.userId);
  }

  @Get('config')
  @ApiOperation({ summary: 'AI yapılandırması', description: 'Mevcut AI görev yapılandırmasını getirir' })
  async getConfig(@Req() req: any) {
    // TODO: AI config'i döndür
    return { message: 'AI config endpoint - admin panelden yönetilir' };
  }
}