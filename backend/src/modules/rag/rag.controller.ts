// ============================================================================
// RAG Controller (rag.controller.ts)
// Açıklama: RAG endpoint'leri
// ============================================================================
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RagService } from './services/rag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('RAG')
@Controller('rag')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RagController {
  constructor(private ragService: RagService) {}

  /**
   * Belgeyi RAG için indeksle
   * 
   * Belgeyi Pinecone'a kaydeder
   */
  @Post('index/:documentId')
  async indexDocument(@Param('documentId') documentId: string, @Req() req: any) {
    // Belgeyi al ve caseId'yi bul
    return this.ragService.indexDocument(documentId, req.user.userId);
  }

  /**
   * Belgeyi indeksden sil
   */
  @Delete('index/:documentId')
  async deleteDocumentIndex(@Param('documentId') documentId: string) {
    return this.ragService.deleteDocumentEmbeddings(documentId);
  }

  /**
   * RAG araması yap
   * 
   * @param query - Arama sorgusu
   * @param caseId - Dava ID (opsiyonel, filtreleme için)
   * @param topK - Kaç sonuç getirilecek
   */
  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('caseId') caseId?: string,
    @Query('topK') topK?: number,
  ) {
    return this.ragService.search(query, caseId, { topK: topK || 5 });
  }

  /**
   * AI için context hazırla
   * 
   * Sorgu için en alakalı belgeleri getirir
   * 
   * @param query - AI'a gönderilecek soru
   * @param caseId - Dava ID (opsiyonel)
   * @param maxChars - Maximum karakter sayısı
   */
  @Get('context')
  async getContext(
    @Query('query') query: string,
    @Query('caseId') caseId?: string,
    @Query('maxChars') maxChars?: number,
  ) {
    const context = await this.ragService.prepareContext(query, caseId, maxChars || 4000);
    return { context, query };
  }

  /**
   * RAG istatistiklerini getir
   */
  @Get('stats')
  async getStats() {
    return this.ragService.getIndexStats();
  }
}