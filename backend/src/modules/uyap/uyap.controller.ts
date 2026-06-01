// ============================================================================
// UYAP Controller (uyap.controller.ts)
// Açıklama: UYAP entegrasyon endpoint'leri
// 
// Bu controller:
// 1. Chrome eklentisinden gelen dava ve belge bilgilerini alır
// 2. Toplu senkronizasyon isteklerini işler
// 3. UYAP bağlantı durumunu döndürür
// 
// Not: UYAP resmi API olmadığı için, veriler Chrome eklentisi üzerinden
// avukatın kendi UYAP hesabından çekilir ve bu endpoint'lere gönderilir.
// ============================================================================
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UyapService, UyapCaseData, UyapDocumentData } from './services/uyap.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('UYAP')
@Controller('uyap')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UyapController {
  constructor(private uyapService: UyapService) {}

  /**
   * Tek Dava Kaydet veya Güncelle
   * 
   * Chrome eklentisinden gelen tek dava bilgilerini kaydeder
   * Aynı uyapId varsa günceller, yoksa yeni oluşturur
   * 
   * @param caseData - UYAP'tan gelen dava bilgileri
   */
  @Post('cases')
  async saveCase(
    @Body() caseData: UyapCaseData,
    @Req() req: any,
  ) {
    return this.uyapService.saveOrUpdateCase(req.user.userId, caseData);
  }

  /**
   * Toplu Dava Kaydet
   * 
   * Chrome eklentisi birden fazla dava gönderebilir
   * Bu endpoint hepsini işler
   * 
   * @param cases - Dava dizisi
   */
  @Post('cases/batch')
  async saveCases(
    @Body() cases: UyapCaseData[],
    @Req() req: any,
  ) {
    return this.uyapService.processIncomingData(req.user.userId, { cases });
  }

  /**
   * Belgeleri Kaydet
   * 
   * Bir davaya ait belgeleri kaydeder
   * Her belge için otomatik olarak RAG embedding oluşturulur
   * 
   * @param caseId - Dava ID'si (veritabanındaki)
   * @param documents - Belge dizisi
   */
  @Post('documents/:caseId')
  async saveDocuments(
    @Param('caseId') caseId: string,
    @Body() documents: UyapDocumentData[],
    @Req() req: any,
  ) {
    return this.uyapService.saveDocuments(req.user.userId, caseId, documents);
  }

  /**
   * Toplu Veri Senkron Et
   * 
   * Hem dava hem de belge içeren toplu senkronizasyon isteği
   * UYAP'tan gelen tüm verileri işler
   * 
   * @param data - { cases: [], documents: { caseId, documents: [] } }
   */
  @Post('sync')
  async syncAll(
    @Body() data: {
      cases?: UyapCaseData[];
      documents?: { caseId: string; documents: UyapDocumentData[] }[];
    },
    @Req() req: any,
  ) {
    return this.uyapService.processIncomingData(req.user.userId, data);
  }

  /**
   * UYAP Bağlantı Durumu
   * 
   * Kullanıcının UYAP eklentisi ile ne zaman senkronize ettiğini gösterir
   */
  @Get('status')
  async getStatus(@Req() req: any) {
    return this.uyapService.getConnectionStatus(req.user.userId);
  }
}