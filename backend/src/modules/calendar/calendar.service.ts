// ============================================================================
// Takvim Servisi (calendar.service.ts)
// Açıklama: Tüm takvim verilerini birleştiren merkezi servis
// 
// Bu servis:
// 1. Duruşmalar, hatırlatıcılar, tebligatlar, ödeme sözleri gibi tüm takvim
//    verilerini tek bir endpoint'ten sunar
// 2. Günlük/Haftalık/Aylık görünüm için optimize edilmiştir
// 3. Takvim item'larını kaynak türüne göre filtreler
// 4. Takvim üzerinde yapılan değişiklikleri yönetir
// 
// Takvim Kaynakları:
// - Duruşmalar (Hearings) - Mahkeme duruşmaları
// - Hatırlatıcılar (Reminders) - Kullanıcı hatırlatıcıları
// - Tebligatlar (Notifications) - UETS'ten gelen tebligatlar
// - İcra takipleri (IcraFiles) - İcra dosyaları
// - Ödeme sözleri (CallRecords) - Call center ödeme sözleri
// ============================================================================
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum CalendarViewType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export enum CalendarItemType {
  HEARING = 'hearing',           // Duruşma
  REMINDER = 'reminder',         // Hatırlatıcı
  NOTIFICATION = 'notification', // Tebligat
  ICRA_FILE = 'icra_file',       // İcra takibi
  PAYMENT_PROMISE = 'payment_promise', // Ödeme sözü
  DEADLINE = 'deadline',         // Süre (otomatik oluşan)
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /**
   * Takvim Verilerini Getir
   * 
   * Belirtilen tarih aralığındaki tüm takvim item'larını getirir
   * Günlük, haftalık veya aylık görünüm için optimize edilmiştir
   * 
   * @param userId - Kullanıcı ID
   * @param startDate - Başlangıç tarihi
   * @param endDate - Bitiş tarihi
   * @param filters - Filtreler (tür, caseId, icraFileId)
   */
  async getCalendarItems(
    userId: string,
    startDate: Date,
    endDate: Date,
    filters?: {
      types?: CalendarItemType[];
      caseId?: string;
      onlyActive?: boolean;
    },
  ): Promise<CalendarItem[]> {
    const items: CalendarItem[] = [];

    // 1. Duruşmaları al
    if (!filters?.types || filters.types.includes(CalendarItemType.HEARING)) {
      const hearings = await this.getHearings(userId, startDate, endDate);
      items.push(...hearings);
    }

    // 2. Hatırlatıcıları al
    if (!filters?.types || filters.types.includes(CalendarItemType.REMINDER)) {
      const reminders = await this.getReminders(userId, startDate, endDate);
      items.push(...reminders);
    }

    // 3. Tebligatları al (süre olanları)
    if (!filters?.types || filters.types.includes(CalendarItemType.NOTIFICATION)) {
      const notifications = await this.getNotifications(userId, startDate, endDate);
      items.push(...notifications);
    }

    // 4. İcra dosyalarını al (satış tarihi olanları)
    if (!filters?.types || filters.types.includes(CalendarItemType.ICRA_FILE)) {
      const icraFiles = await this.getIcraFiles(userId, startDate, endDate);
      items.push(...icraFiles);
    }

    // 5. Ödeme sözlerini al
    if (!filters?.types || filters.types.includes(CalendarItemType.PAYMENT_PROMISE)) {
      const promises = await this.getPaymentPromises(userId, startDate, endDate);
      items.push(...promises);
    }

    // 6. CaseId filtresi uygula
    if (filters?.caseId) {
      items = items.filter(item => item.caseId === filters.caseId);
    }

    // 7. Aktif/Pasif filtresi uygula
    if (filters?.onlyActive) {
      items = items.filter(item => item.status === 'active');
    }

    // Tarihe göre sırala
    return items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  /**
   * Takvim Item'ını Güncelle
   */
  async updateCalendarItem(
    userId: string,
    itemId: string,
    itemType: CalendarItemType,
    data: Partial<{ title: string; startDate: Date; endDate: Date; notes: string; status: string }>,
  ): Promise<any> {
    switch (itemType) {
      case CalendarItemType.HEARING:
        return this.prisma.hearing.update({
          where: { id: itemId },
          data: {
            hearingDate: data.startDate,
            court: data.notes,
          },
        });

      case CalendarItemType.REMINDER:
        return this.prisma.reminder.update({
          where: { id: itemId },
          data: {
            title: data.title,
            dueDate: data.startDate,
            description: data.notes,
            status: data.status as any,
          },
        });

      case CalendarItemType.NOTIFICATION:
        return this.prisma.notification.update({
          where: { id: itemId },
          data: {
            title: data.title,
            deadline: data.startDate,
          },
        });

      default:
        throw new Error(`Güncelleme desteklenmiyor: ${itemType}`);
    }
  }

  /**
   * Takvim Item'ını Sil
   */
  async deleteCalendarItem(
    userId: string,
    itemId: string,
    itemType: CalendarItemType,
  ): Promise<void> {
    switch (itemType) {
      case CalendarItemType.HEARING:
        await this.prisma.hearing.delete({ where: { id: itemId } });
        break;

      case CalendarItemType.REMINDER:
        await this.prisma.reminder.update({
          where: { id: itemId },
          data: { status: 'CANCELLED' as any },
        });
        break;

      case CalendarItemType.PAYMENT_PROMISE:
        await this.prisma.icraCallRecord.update({
          where: { id: itemId },
          data: { callResult: 'CANCELLED' as any },
        });
        break;

      default:
        throw new Error(`Silme desteklenmiyor: ${itemType}`);
    }
  }

  /**
   * Takvim İstatistikleri
   */
  async getCalendarStats(userId: string, startDate: Date, endDate: Date): Promise<{
    totalItems: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    upcomingToday: number;
    overdue: number;
  }> {
    const items = await this.getCalendarItems(userId, startDate, endDate);

    const stats = {
      totalItems: items.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      upcomingToday: 0,
      overdue: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const item of items) {
      // By type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

      // By status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;

      // Today
      if (item.startDate >= today && item.startDate < tomorrow) {
        stats.upcomingToday++;
      }

      // Overdue
      if (item.status === 'active' && item.endDate && item.endDate < today) {
        stats.overdue++;
      }
    }

    return stats;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private async getHearings(userId: string, startDate: Date, endDate: Date): Promise<CalendarItem[]> {
    const hearings = await this.prisma.hearing.findMany({
      where: {
        case: { userId },
        hearingDate: { gte: startDate, lte: endDate },
      },
      include: { case: { select: { id: true, caseNumber: true } } },
    });

    return hearings.map(h => ({
      id: h.id,
      type: CalendarItemType.HEARING,
      title: `Duruşma: ${h.case.caseNumber}`,
      description: h.notes || `Mahkeme: ${h.court}`,
      startDate: h.hearingDate,
      endDate: h.hearingDate,
      status: h.status === 'COMPLETED' ? 'completed' : 'active',
      caseId: h.caseId,
      caseNumber: h.case.caseNumber,
      court: h.court,
      source: 'case',
    }));
  }

  private async getReminders(userId: string, startDate: Date, endDate: Date): Promise<CalendarItem[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        dueDate: { gte: startDate, lte: endDate },
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    return reminders.map(r => ({
      id: r.id,
      type: CalendarItemType.REMINDER,
      title: r.title,
      description: r.description || '',
      startDate: r.dueDate,
      endDate: r.remindAt || r.dueDate,
      status: r.isCompleted ? 'completed' : 'active',
      caseId: r.caseId || undefined,
      caseNumber: undefined,
      source: 'reminder',
      reminderType: r.type,
    }));
  }

  private async getNotifications(userId: string, startDate: Date, endDate: Date): Promise<CalendarItem[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        deadline: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      include: { case: { select: { id: true, caseNumber: true } } },
    });

    return notifications.map(n => ({
      id: n.id,
      type: CalendarItemType.NOTIFICATION,
      title: n.title,
      description: n.content || '',
      startDate: n.deadline || n.sentDate,
      endDate: n.deadline,
      status: n.isRead ? 'completed' : 'active',
      caseId: n.caseId || undefined,
      caseNumber: n.case?.caseNumber,
      source: 'notification',
      notificationType: n.type,
    }));
  }

  private async getIcraFiles(userId: string, startDate: Date, endDate: Date): Promise<CalendarItem[]> {
    const icraFiles = await this.prisma.icraFile.findMany({
      where: {
        userId,
        satışTarihi: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
    });

    return icraFiles.map(f => ({
      id: f.id,
      type: CalendarItemType.ICRA_FILE,
      title: `İcra Satış: ${f.takipNumarasi}`,
      description: f.sonrakiAsama || '',
      startDate: f.satişTarihi!,
      endDate: f.satişTarihi!,
      status: f.aktif ? 'active' : 'completed',
      caseId: undefined,
      caseNumber: undefined,
      source: 'icra',
      icraInfo: {
        takipNumarasi: f.takipNumarasi,
        borclu: f.borclu,
        kalanMiktar: f.kalanMiktar.toNumber(),
      },
    }));
  }

  private async getPaymentPromises(userId: string, startDate: Date, endDate: Date): Promise<CalendarItem[]> {
    const promises = await this.prisma.icraCallRecord.findMany({
      where: {
        userId,
        paymentPromiseDate: { gte: startDate, lte: endDate },
        callResult: 'PAYMENT_PROMISE',
        paymentKept: false,
        deletedAt: null,
      },
      include: {
        icraFile: { select: { takipNumarasi: true, borclu: true } },
      },
    });

    return promises.map(p => ({
      id: p.id,
      type: CalendarItemType.PAYMENT_PROMISE,
      title: `Ödeme Sözü: ${p.icraFile.borclu}`,
      description: p.notes || '',
      startDate: p.paymentPromiseDate!,
      endDate: p.paymentPromiseDate!,
      status: 'active',
      caseId: undefined,
      caseNumber: p.icraFile.takipNumarasi,
      source: 'call_center',
      paymentPromiseInfo: {
        borclu: p.icraFile.borclu,
        takipNumarasi: p.icraFile.takipNumarasi,
      },
    }));
  }
}

/**
 * Takvim Item interface
 */
export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  caseId?: string;
  caseNumber?: string;
  court?: string;
  source: 'case' | 'reminder' | 'notification' | 'icra' | 'call_center';
  // Ek bilgiler
  reminderType?: string;
  notificationType?: string;
  icraInfo?: {
    takipNumarasi: string;
    borclu: string;
    kalanMiktar: number;
  };
  paymentPromiseInfo?: {
    borclu: string;
    takipNumarasi: string;
  };
}