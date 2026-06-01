// ============================================================================
// Call Center Servisi (call-center.service.ts)
// Açıklama: Borçlu ile iletişim takibi ve call center entegrasyonu
// 
// Bu servis:
// 1. Borçlu ile yapılan görüşmeleri kaydeder
// 2. Ödeme sözü takibi yapar
// 3. Yeniden arama hatırlatıcıları oluşturur
// 4. Call center operatör performansını takip eder
// 
// Call Center İş Akışı:
// 1. Avukat/operatör borçluyu arar
// 2. Görüşme sonucunu kaydeder (ödeme sözü, cevap yok, red, vs)
// 3. Ödeme sözü verildiyse tarih belirlenir
// 4. Sistem otomatik olarak yeniden arama hatırlatıcısı oluşturur
// 5. Performans raporları oluşturulur
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum CallResult {
  ANSWERED = 'answered',           // Cevap verdi
  NO_ANSWER = 'no_answer',         // Cevap vermedi
  BUSY = 'busy',                   // Meşgul
  WRONG_NUMBER = 'wrong_number',   // Yanlış numara
  PAYMENT_PROMISE = 'payment_promise', // Ödeme sözü
  REFUSED = 'refused',             // Reddetti
  CALLBACK_REQUESTED = 'callback', // Geri arama istedi
}

export enum CallDirection {
  OUTBOUND = 'outbound',  // Çıkış araması
  INBOUND = 'inbound',    // Geliş araması
}

@Injectable()
export class CallCenterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Arama Kaydı Oluştur
   * 
   * Borçlu ile yapılan aramanın sonucunu kaydeder
   * Ödeme sözü verildiyse otomatik hatırlatıcı oluşturur
   * 
   * @param userId - Avukat/operatör ID
   * @param icraFileId - İcra dosyası ID
   * @param callResult - Arama sonucu
   * @param notes - Notlar
   * @param paymentPromiseDate - Ödeme sözü tarihi (varsa)
   */
  async recordCall(
    userId: string,
    icraFileId: string,
    callResult: CallResult,
    notes?: string,
    paymentPromiseDate?: Date,
  ): Promise<any> {
    // İcra dosyasını kontrol et
    const file = await this.prisma.icraFile.findFirst({
      where: { id: icraFileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    // Arama kaydı oluştur
    const callRecord = await this.prisma.icraCallRecord.create({
      data: {
        icraFileId,
        userId,
        callResult,
        notes,
        paymentPromiseDate,
        callDirection: CallDirection.OUTBOUND,
      },
    });

    // Ödeme sözü verildiyse hatırlatıcı oluştur
    if (callResult === CallResult.PAYMENT_PROMISE && paymentPromiseDate) {
      await this.createPaymentPromiseReminder(icraFileId, userId, paymentPromiseDate, callRecord.id);
    }

    // Geri arama istendiyse hatırlatıcı oluştur
    if (callResult === CallResult.CALLBACK_REQUESTED) {
      const callbackDate = new Date();
      callbackDate.setDate(callbackDate.getDate() + 1); // 1 gün sonra
      await this.createCallbackReminder(icraFileId, userId, callbackDate, callRecord.id);
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CALL_RECORDED',
        entityType: 'icra_call_records',
        entityId: callRecord.id,
        newValue: { icraFileId, callResult, notes } as any,
      },
    });

    return callRecord;
  }

  /**
   * Arama Geçmişini Getir
   */
  async getCallHistory(icraFileId: string, userId: string): Promise<any[]> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: icraFileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    return this.prisma.icraCallRecord.findMany({
      where: { icraFileId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Bekleyen Ödeme Sözlerini Getir
   */
  async getPendingPromises(userId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.icraCallRecord.findMany({
      where: {
        userId,
        callResult: CallResult.PAYMENT_PROMISE,
        paymentPromiseDate: { gte: today },
        paymentKept: false,
        deletedAt: null,
      },
      include: {
        icraFile: { select: { takipNumarasi: true, borclu: true, kalanMiktar: true } },
      },
      orderBy: { paymentPromiseDate: 'asc' },
    });
  }

  /**
   * Ödeme Sözü Tutuldu İşaretle
   */
  async markPromiseKept(callRecordId: string, userId: string): Promise<void> {
    await this.prisma.icraCallRecord.update({
      where: { id: callRecordId },
      data: { paymentKept: true },
    });
  }

  /**
   * Operatör Performans Raporu
   */
  async getOperatorPerformance(userId: string, startDate: Date, endDate: Date): Promise<{
    totalCalls: number;
    answered: number;
    noAnswer: number;
    paymentPromises: number;
    promisesKept: number;
    averageCallsPerDay: number;
  }> {
    const records = await this.prisma.icraCallRecord.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const totalCalls = records.length;
    const answered = records.filter(r => r.callResult === CallResult.ANSWERED).length;
    const noAnswer = records.filter(r => r.callResult === CallResult.NO_ANSWER).length;
    const paymentPromises = records.filter(r => r.callResult === CallResult.PAYMENT_PROMISE).length;
    const promisesKept = records.filter(r => r.paymentKept).length;

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalCalls,
      answered,
      noAnswer,
      paymentPromises,
      promisesKept,
      averageCallsPerDay: days > 0 ? totalCalls / days : 0,
    };
  }

  /**
   * Borçlu Arama Listesi (Öncelik Sırasına Göre)
   */
  async getCallList(userId: string): Promise<any[]> {
    // Önce ödeme sözü olanları getir (süresi geçmek üzere olanlar)
    const pendingPromises = await this.prisma.icraCallRecord.findMany({
      where: {
        userId,
        callResult: CallResult.PAYMENT_PROMISE,
        paymentKept: false,
        deletedAt: null,
      },
      include: {
        icraFile: {
          select: {
            takipNumarasi: true,
            borclu: true,
            borcluTC: true,
            kalanMiktar: true,
          },
        },
      },
    });

    // Aktif takiplerdeki son arama kayıtlarını al
    const activeFiles = await this.prisma.icraFile.findMany({
      where: { userId, aktif: true, deletedAt: null },
      select: { id: true },
    });

    const callList = pendingPromises.map(p => ({
      icraFileId: p.icraFileId,
      takipNumarasi: p.icraFile.takipNumarasi,
      borclu: p.icraFile.borclu,
      borcluTC: p.icraFile.borcluTC,
      kalanMiktar: p.icraFile.kalanMiktar,
      priority: 'high',
      reason: 'Ödeme sözü bekleniyor',
      promiseDate: p.paymentPromiseDate,
      daysOverdue: Math.floor((Date.now() - p.paymentPromiseDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return callList.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  /**
   * Hatırlatıcı oluştur (ödeme sözü)
   */
  private async createPaymentPromiseReminder(
    icraFileId: string,
    userId: string,
    promiseDate: Date,
    callRecordId: string,
  ): Promise<void> {
    // Ödeme günü hatırlatıcısı
    await this.prisma.reminder.create({
      data: {
        userId,
        icraFileId,
        type: 'ICRA' as any,
        title: `Ödeme Sözü: ${promiseDate.toLocaleDateString('tr-TR')}`,
        dueDate: promiseDate,
        remindAt: new Date(promiseDate.getTime() - 24 * 60 * 60 * 1000), // 1 gün önce
        notifyTypes: ['push', 'sms'] as any,
        status: 'ACTIVE' as any,
      },
    });

    // Ödeme günü geçtiyse gecikme hatırlatıcısı
    const overdueDate = new Date(promiseDate);
    overdueDate.setDate(overdueDate.getDate() + 1);

    await this.prisma.reminder.create({
      data: {
        userId,
        icraFileId,
        type: 'ICRA' as any,
        title: `⚠️ Ödeme Sözü Gecikti!`,
        dueDate: overdueDate,
        remindAt: new Date(overdueDate.getTime()),
        notifyTypes: ['push', 'sms', 'email'] as any,
        status: 'ACTIVE' as any,
      },
    });
  }

  /**
   * Hatırlatıcı oluştur (geri arama)
   */
  private async createCallbackReminder(
    icraFileId: string,
    userId: string,
    callbackDate: Date,
    callRecordId: string,
  ): Promise<void> {
    await this.prisma.reminder.create({
      data: {
        userId,
        icraFileId,
        type: 'ICRA' as any,
        title: '📞 Geri Arama: Borçlu',
        dueDate: callbackDate,
        remindAt: new Date(callbackDate.getTime() - 60 * 60 * 1000), // 1 saat önce
        notifyTypes: ['push'] as any,
        status: 'ACTIVE' as any,
      },
    });
  }
}