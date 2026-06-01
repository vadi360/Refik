// ============================================================================
// Case Update Controller (case-update.controller.ts)
// Açıklama: Dosya güncelleme API endpoint'leri
// 
// Bu controller:
// 1. Dosyaya yeni içerik ekleme ve analiz
// 2. Yapılacaklar listesi yönetimi
// 3. Kronoloji görüntüleme
// 
// Endpoint'ler:
// - POST /ai/case-update - Dosya güncelle ve analiz et
// - GET /ai/case-update/:caseId/actions - Yapılacakları getir
// - PUT /ai/case-update/actions - Yapılacak güncelle
// - POST /ai/case-update/actions - Yapılacak ekle
// - DELETE /ai/case-update/:caseId/actions/:index - Yapılacak sil
// - GET /ai/case-update/:caseId/timeline - Kronoloji getir
// ============================================================================

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CaseUpdateService } from './case-update.service';
import {
  CaseUpdateRequestDto,
  CaseUpdateResponseDto,
  GetActionItemsRequestDto,
  UpdateActionItemDto,
  ActionItemsResponseDto,
} from './dto/case-update.dto';

@ApiTags('AI - Dosya Güncelleme')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CaseUpdateController {
  constructor(private readonly caseUpdateService: CaseUpdateService) {}

  /**
   * POST /ai/case-update
   * 
   * Dosyayı güncelle ve AI analiz et
   * 
   * Yeni içerik eklendiğinde (tebligat, belge, duruşma sonucu, vb.):
   * 1. AI mevcut özeti ve yeni içeriği analiz eder
   * 2. Güncellenmiş özet oluşturur
   * 3. Yapılacaklar önerisi çıkarır
   * 4. Hatırlatıcı oluşturur
   * 5. Kronolojik güncelleme kaydeder
   */
  @Post('case-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dosya güncelle ve AI analiz et',
    description: 'Yeni içerik eklendiğinde AI analizi ile özet, yapılacaklar ve hatırlatıcı oluştur',
  })
  @ApiResponse({ status: 200, description: 'Güncelleme başarılı', type: CaseUpdateResponseDto })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  @ApiResponse({ status: 401, description: 'Yetkisiz' })
  @ApiResponse({ status: 404, description: 'Dosya bulunamadı' })
  async updateCase(
    @Body() dto: CaseUpdateRequestDto,
    @CurrentUser() user: { userId: string },
  ): Promise<CaseUpdateResponseDto> {
    return this.caseUpdateService.updateCase(dto, user.userId);
  }

  /**
   * GET /ai/case-update/:caseId/actions
   * 
   * Dosyadaki yapılacakları getir
   */
  @Get('case-update/:caseId/actions')
  @ApiOperation({
    summary: 'Yapılacakları getir',
    description: 'Belirtilen dosyadaki AI önerili yapılacakları listeler',
  })
  @ApiResponse({ status: 200, description: 'Yapılacaklar listesi', type: ActionItemsResponseDto })
  async getActionItems(
    @Param('caseId') caseId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ActionItemsResponseDto> {
    return this.caseUpdateService.getActionItems({ caseId }, user.userId);
  }

  /**
   * PUT /ai/case-update/actions
   * 
   * Yapılacak durumunu güncelle (tamamla, iptal et, vb.)
   */
  @Put('case-update/actions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Yapılacak güncelle',
    description: 'Yapılacak bir itemin durumunu günceller (pending, in_progress, completed, cancelled)',
  })
  @ApiResponse({ status: 200, description: 'Güncelleme başarılı' })
  async updateActionItem(
    @Body() dto: UpdateActionItemDto,
    @CurrentUser() user: { userId: string },
  ): Promise<any> {
    return this.caseUpdateService.updateActionItem(dto, user.userId);
  }

  /**
   * POST /ai/case-update/:caseId/actions
   * 
   * Manuel olarak yapılacak ekle
   */
  @Post('case-update/:caseId/actions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yapılacak ekle',
    description: 'Manuel olarak yeni yapılacak ekler ve hatırlatıcı oluşturur',
  })
  @ApiResponse({ status: 201, description: 'Ekleme başarılı' })
  async addActionItem(
    @Param('caseId') caseId: string,
    @Body() item: { task: string; deadline: string; priority: string; description?: string },
    @CurrentUser() user: { userId: string },
  ): Promise<any> {
    return this.caseUpdateService.addActionItem(caseId, user.userId, item);
  }

  /**
   * DELETE /ai/case-update/:caseId/actions/:index
   * 
   * Yapılacak sil
   */
  @Delete('case-update/:caseId/actions/:index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Yapılacak sil',
    description: 'Belirtilen indexteki yapılacağı siler',
  })
  @ApiResponse({ status: 200, description: 'Silme başarılı' })
  async deleteActionItem(
    @Param('caseId') caseId: string,
    @Param('index') index: string,
    @CurrentUser() user: { userId: string },
  ): Promise<any> {
    return this.caseUpdateService.deleteActionItem(caseId, index, user.userId);
  }

  /**
   * GET /ai/case-update/:caseId/timeline
   * 
   * Kronolojik gelişmeleri getir
   */
  @Get('case-update/:caseId/timeline')
  @ApiOperation({
    summary: 'Kronoloji getir',
    description: 'Dosyadaki tüm gelişmeleri kronolojik sırayla getirir',
  })
  @ApiResponse({ status: 200, description: 'Kronoloji listesi' })
  async getTimeline(
    @Param('caseId') caseId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<any[]> {
    return this.caseUpdateService.getTimeline(caseId, user.userId);
  }

  /**
   * POST /ai/case-update/:caseId/summarize
   * 
   * Dosyanın tamamını yeniden özetle
   * (Mevcut belgeler, tebligatlar, duruşmalar vs. hepsini analiz eder)
   */
  @Post('case-update/:caseId/summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dosyayı yeniden özetle',
    description: 'Tüm mevcut içerikleri analiz ederek tam bir özet oluşturur',
  })
  @ApiResponse({ status: 200, description: 'Özet başarılı' })
  async resummarizeCase(
    @Param('caseId') caseId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<{ summary: string; model: string; confidence: number }> {
    // Bu metod tüm case verilerini alır ve AI ile özetler
    return this.caseUpdateService.resummarizeCase(caseId, user.userId);
  }
}