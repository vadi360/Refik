// ============================================================================
// İcra Controller (icra.controller.ts)
// Açıklama: İcra takip endpoint'leri
// 
// Bu controller:
// 1. İcra takibi başlatma/güncelleme
// 2. Dosya listeleme ve detay
// 3. Tahsilat ekleme
// 4. AI analiz
// ============================================================================
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IcraService, IcraFileStatus } from './icra.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('İcra Takibi')
@Controller('icra')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IcraController {
  constructor(private icraService: IcraService) {}

  /**
   * İcra Takibi Başlat
   * 
   * @param takipNumarasi - İcra takip numarası
   * @param alacakli - Alacaklı (müvekkil)
   * @param borclu - Borçlu
   */
  @Post('track')
  async startTracking(
    @Body('takipNumarasi') takipNumarasi: string,
    @Body('alacakli') alacakli: string,
    @Body('borclu') borclu: string,
    @Req() req: any,
  ) {
    return this.icraService.startTracking(
      req.user.userId,
      takipNumarasi,
      alacakli,
      borclu,
    );
  }

  /**
   * İcra Dosyasını Güncelle (UYAP'tan çek)
   */
  @Post('refresh/:fileId')
  async refreshTracking(
    @Param('fileId') fileId: string,
    @Req() req: any,
  ) {
    return this.icraService.refreshTracking(req.user.userId, fileId);
  }

  /**
   * Tüm İcra Dosyalarımı Getir
   */
  @Get('files')
  async getAllFiles(
    @Query('durum') durum?: IcraFileStatus,
    @Query('aktif') aktif?: boolean,
    @Req() req: any,
  ) {
    return this.icraService.getAllFiles(req.user.userId, { durum, aktif });
  }

  /**
   * Tek İcra Dosyası Getir
   */
  @Get('files/:fileId')
  async getFile(
    @Param('fileId') fileId: string,
    @Req() req: any,
  ) {
    return this.icraService.getFile(req.user.userId, fileId);
  }

  /**
   * Tahsilat Ekle
   */
  @Post('files/:fileId/payments')
  async addPayment(
    @Param('fileId') fileId: string,
    @Body('amount') amount: number,
    @Body('date') date: string,
    @Body('description') description?: string,
    @Req() req: any,
  ) {
    return this.icraService.addPayment(
      req.user.userId,
      fileId,
      amount,
      new Date(date),
      description,
    );
  }

  /**
   * İcra Dosyasını Kapat
   */
  @Put('files/:fileId/close')
  async closeFile(
    @Param('fileId') fileId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    await this.icraService.closeFile(req.user.userId, fileId, reason);
    return { success: true, message: 'İcra dosyası kapatıldı' };
  }

  /**
   * AI ile Durum Analizi
   */
  @Post('files/:fileId/analyze')
  async analyzeStatus(
    @Param('fileId') fileId: string,
    @Req() req: any,
  ) {
    return this.icraService.analyzeStatus(req.user.userId, fileId);
  }
}