// ============================================================================
// Kullanıcı Evrakları Controller (user-documents.controller.ts)
// Açıklama: Kullanıcı evrakları endpoint'leri
// 
// Bu controller:
// 1. Avukatın evrak yüklemesini sağlar
// 2. Evrak listeleme ve silmeyi yönetir
// 3. Admin için onay/reddetme işlemlerini yönetir
// ============================================================================
import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserDocumentsService, DocumentCategory } from './user-documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Kullanıcı Evrakları')
@Controller('user-documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserDocumentsController {
  constructor(private userDocumentsService: UserDocumentsService) {}

  /**
   * Evrak Yükle
   * 
   * @param category - Evrak kategorisi
   * @param fileUrl - Dosya URL
   * @param originalName - Orijinal dosya adı
   */
  @Post('upload')
  async uploadDocument(
    @Body('category') category: DocumentCategory,
    @Body('fileUrl') fileUrl: string,
    @Body('originalName') originalName: string,
    @Req() req: any,
  ) {
    return this.userDocumentsService.uploadDocument(
      req.user.userId,
      category,
      fileUrl,
      originalName,
    );
  }

  /**
   * Evraklarımı Listele
   */
  @Get('my')
  async getMyDocuments(@Req() req: any) {
    return this.userDocumentsService.getUserDocuments(req.user.userId);
  }

  /**
   * Doğrulama Durumu
   */
  @Get('status')
  async getVerificationStatus(@Req() req: any) {
    return this.userDocumentsService.getVerificationStatus(req.user.userId);
  }

  /**
   * Evrak Sil
   */
  @Delete(':id')
  async deleteDocument(
    @Param('id') documentId: string,
    @Req() req: any,
  ) {
    await this.userDocumentsService.deleteDocument(req.user.userId, documentId);
    return { success: true, message: 'Evrak silindi' };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Admin: Onay Bekleyen Evrakları Listele
   */
  @Get('admin/pending')
  async getPendingDocuments() {
    return this.userDocumentsService.getPendingDocuments();
  }

  /**
   * Admin: Evrak Onayla
   */
  @Put('admin/approve/:id')
  async approveDocument(
    @Param('id') documentId: string,
    @Body('notes') notes?: string,
    @Req() req: any,
  ) {
    return this.userDocumentsService.approveDocument(
      req.user.userId,
      documentId,
      notes,
    );
  }

  /**
   * Admin: Evrak Reddet
   */
  @Put('admin/reject/:id')
  async rejectDocument(
    @Param('id') documentId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.userDocumentsService.rejectDocument(
      req.user.userId,
      documentId,
      reason,
    );
  }

  /**
   * Admin: Revizyon İste
   */
  @Put('admin/revision/:id')
  async requestRevision(
    @Param('id') documentId: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.userDocumentsService.requestRevision(
      req.user.userId,
      documentId,
      notes,
    );
  }
}