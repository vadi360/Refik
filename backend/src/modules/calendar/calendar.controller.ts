// ============================================================================
// Takvim Controller (calendar.controller.ts)
// Açıklama: Takvim endpoint'leri
// 
// Bu controller:
// 1. Takvim verilerini günlük/haftalık/aylık görünüm olarak sunar
// 2. Tüm kaynaklardan (duruşma, hatırlatıcı, tebligat, icra, ödeme sözü)
//    gelen verileri birleştirir
// 3. Takvim item'larının CRUD işlemlerini yönetir
// 4. Takvim istatistiklerini sunar
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
import { CalendarService, CalendarItemType } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Takvim')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  /**
   * Takvim Verilerini Getir
   * 
   * Belirtilen tarih aralığındaki tüm takvim item'larını getirir
   * Günlük, haftalık veya aylık görünüm için tarih aralığı ayarlayın
   * 
   * @param startDate - Başlangıç tarihi (ISO format)
   * @param endDate - Bitiş tarihi (ISO format)
   * @param types - Filtrelemek için item türleri (hearing,reminder,notification,icra_file,payment_promise)
   * @param caseId - Belirli bir dosyaya ait item'lar
   * @param onlyActive - Sadece aktif item'ları getir
   */
  @Get('items')
  async getCalendarItems(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('types') types?: string, // comma-separated: hearing,reminder,notification
    @Query('caseId') caseId?: string,
    @Query('onlyActive') onlyActive?: boolean,
    @Req() req: any,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const typeFilters = types
      ? types.split(',').map(t => t.trim() as CalendarItemType)
      : undefined;

    return this.calendarService.getCalendarItems(req.user.userId, start, end, {
      types: typeFilters,
      caseId,
      onlyActive,
    });
  }

  /**
   * Takvim İstatistikleri
   * 
   * Belirtilen tarih aralığındaki takvim istatistiklerini getirir
   */
  @Get('stats')
  async getCalendarStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.calendarService.getCalendarStats(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Takvim Item'ını Güncelle
   * 
   * Duruşma veya hatırlatıcı gibi takvim item'larını günceller
   * 
   * @param itemType - Item türü (hearing, reminder, notification)
   * @param itemId - Item ID
   * @param title - Yeni başlık (opsiyonel)
   * @param startDate - Yeni tarih (opsiyonel)
   * @param notes - Notlar (opsiyonel)
   */
  @Put('items/:itemType/:itemId')
  async updateCalendarItem(
    @Param('itemType') itemType: CalendarItemType,
    @Param('itemId') itemId: string,
    @Body() body: { title?: string; startDate?: string; notes?: string; status?: string },
    @Req() req: any,
  ) {
    return this.calendarService.updateCalendarItem(
      req.user.userId,
      itemId,
      itemType,
      {
        title: body.title,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        notes: body.notes,
        status: body.status,
      },
    );
  }

  /**
   * Takvim Item'ını Sil
   * 
   * Takvim item'ını siler (veya pasif yapar)
   * 
   * @param itemType - Item türü
   * @param itemId - Item ID
   */
  @Delete('items/:itemType/:itemId')
  async deleteCalendarItem(
    @Param('itemType') itemType: CalendarItemType,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ) {
    await this.calendarService.deleteCalendarItem(req.user.userId, itemId, itemType);
    return { success: true, message: 'Takvim item silindi' };
  }

  /**
   * Haftalık Görünüm Verileri
   * 
   * Bu hafta için tüm takvim item'larını getirir
   * Hızlı erişim için kolaylaştırılmış endpoint
   */
  @Get('this-week')
  async getThisWeek(@Req() req: any) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.calendarService.getCalendarItems(
      req.user.userId,
      startOfWeek,
      endOfWeek,
      { onlyActive: true },
    );
  }

  /**
   * Aylık Görünüm Verileri
   * 
   * Bu ay için tüm takvim item'larını getirir
   * Hızlı erişim için kolaylaştırılmış endpoint
   */
  @Get('this-month')
  async getThisMonth(@Req() req: any) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.calendarService.getCalendarItems(
      req.user.userId,
      startOfMonth,
      endOfMonth,
    );
  }

  /**
   * Bugünkü Özet
   * 
   * Bugün için takvim özetini getirir
   */
  @Get('today')
  async getToday(@Req() req: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const items = await this.calendarService.getCalendarItems(
      req.user.userId,
      today,
      tomorrow,
      { onlyActive: true },
    );

    const stats = await this.calendarService.getCalendarStats(
      req.user.userId,
      today,
      tomorrow,
    );

    return {
      date: today.toISOString().split('T')[0],
      items,
      stats: {
        total: items.length,
        hearings: items.filter(i => i.type === CalendarItemType.HEARING).length,
        reminders: items.filter(i => i.type === CalendarItemType.REMINDER).length,
        deadlines: items.filter(i => i.type === CalendarItemType.NOTIFICATION).length,
        icraEvents: items.filter(i => i.type === CalendarItemType.ICRA_FILE).length,
        paymentPromises: items.filter(i => i.type === CalendarItemType.PAYMENT_PROMISE).length,
      },
    };
  }

  /**
   * Yaklaşan Önemli Tarihler
   * 
   * Önümüzdeki 7 gündeki önemli tarihleri getirir
   */
  @Get('upcoming')
  async getUpcoming(@Req() req: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return this.calendarService.getCalendarItems(
      req.user.userId,
      today,
      nextWeek,
      { onlyActive: true },
    );
  }

  /**
   * Overdue (Gecikmiş) Item'lar
   * 
   * Süresi geçmiş ancak henüz tamamlanmamış item'ları getirir
   */
  @Get('overdue')
  async getOverdue(@Req() req: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Geçmiş 30 günlük veriyi al
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);

    const items = await this.calendarService.getCalendarItems(
      req.user.userId,
      startDate,
      today,
      { onlyActive: true },
    );

    // Sadece geçmiş olanları filtrele
    return items.filter(item => item.endDate < today && item.status === 'active');
  }
}