// ============================================================================
// Notifications Controller (notifications.controller.ts)
// Açıklama: Tebligat endpoint'leri
// 
// Endpoint'ler:
// - GET /notifications - Tebligat listesi
// - GET /notifications/unread-count - Okunmamış sayısı
// - GET /notifications/:id - Tebligat detay
// - PUT /notifications/:id/read - Okundu işaretle
// - PUT /notifications/:id/star - Yıldızla/yıldızı kaldır
// - POST /notifications/:id/reminder - Hatırlatıcı ekle
// - POST /notifications/:id/link-case - Davaya ekle
// - GET /notifications/auto-process - 5 gün kuralı için otomatik işlenecekler
// - POST /notifications/:id/auto-process - 5 gün kuralı otomatik işle
// ============================================================================
import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationService, NotificationChannel } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private notificationService: NotificationService,
  ) {}

  @Get()
  async findAll(
    @Req() req: any, 
    @Query('isRead') isRead?: string, 
    @Query('type') type?: string, 
    @Query('page') page?: number, 
    @Query('limit') limit?: number
  ) {
    return this.notificationsService.findAll(req.user.userId, { 
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined, 
      type, page, limit 
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    return { count: await this.notificationsService.getUnreadCount(req.user.userId) };
  }

  @Get('auto-process')
  async getAutoProcessNotifications(@Req() req: any) {
    return this.notificationsService.getAutoProcessNotifications(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.findOne(id, req.user.userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Put(':id/star')
  async toggleStar(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.toggleStar(id, req.user.userId);
  }

  @Post(':id/reminder')
  async createReminder(
    @Param('id') id: string, 
    @Body() body: { dueDate?: Date; title?: string; notifyTypes?: string[] }, 
    @Req() req: any
  ) {
    return this.notificationsService.createReminder(id, req.user.userId, body);
  }

  @Post(':id/link-case')
  async linkToCase(
    @Param('id') id: string, 
    @Body() body: { caseId?: string }, 
    @Req() req: any
  ) {
    return this.notificationsService.linkToCase(id, body.caseId || null, req.user.userId);
  }

  @Post(':id/auto-process')
  async autoProcessNotification(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.autoProcessNotification(id, req.user.userId);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ÇOKLU KANAL BİLDİRİM UÇ NOKTALARI
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Bildirim Gönder (Çoklu Kanal)
   * 
   * Push, SMS, Email, WhatsApp, Telegram kanallarından birine veya tümüne
   * bildirim gönderir
   * 
   * @param title - Bildirim başlığı
   * @param body - Bildirim içeriği
   * @param channels - Gönderilecek kanallar (varsayılan: push + email)
   */
  @Post('send')
  async sendNotification(
    @Body() body: { title: string; body: string; channels?: NotificationChannel[]; priority?: string },
    @Req() req: any,
  ) {
    return this.notificationService.sendToUser(req.user.userId, {
      title: body.title,
      body: body.body,
      channels: body.channels,
      priority: body.priority as any,
    });
  }

  /**
   * Bildirim Şablonu Gönder
   */
  @Post('send-template')
  async sendWithTemplate(
    @Body() body: { templateId: string; variables: Record<string, string>; channels?: NotificationChannel[] },
    @Req() req: any,
  ) {
    return this.notificationService.sendWithTemplate(req.user.userId, body.templateId, body.variables, body.channels);
  }

  /**
   * Bildirim Tercihlerini Güncelle
   */
  @Put('preferences')
  async updatePreferences(
    @Body() body: { pushEnabled?: boolean; smsEnabled?: boolean; emailEnabled?: boolean; whatsappEnabled?: boolean; telegramId?: string },
    @Req() req: any,
  ) {
    await this.notificationService.updatePreferences(req.user.userId, body);
    return { success: true, message: 'Tercihler güncellendi' };
  }

  /**
   * Bildirim Geçmişi
   */
  @Get('history')
  async getHistory(@Query('limit') limit?: number, @Req() req: any) {
    return this.notificationService.getHistory(req.user.userId, limit);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN BROADCAST
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Tüm Kullanıcılara Broadcast (Admin)
   */
  @Post('broadcast')
  async broadcast(
    @Body() body: { title: string; body: string; channels?: NotificationChannel[]; priority?: string },
    @Req() req: any,
  ) {
    // Admin kontrolü yapılabilir (role === 'super_admin')
    return this.notificationService.broadcast({
      title: body.title,
      body: body.body,
      channels: body.channels,
      priority: body.priority as any,
    });
  }
}