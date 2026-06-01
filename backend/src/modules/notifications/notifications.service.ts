// ============================================================================
// Notifications Servisi (notifications.service.ts)
// Açıklama: Tebligat işlemleri servisi
// 
// Bu servis:
// 1. Tebligatları listeler, okundu işaretler
// 2. Okunmamış sayısını döndürür
// 3. Yıldızlama ve hatırlatıcı ekleme
// 4. 5 GÜN KURALI otomasyonu:
//    - UETS'te açılmamış tebligatları izler
//    - 5. gün geçtiyse otomatik olarak indir ve işle
//    - Süre bilgilerini AI ile çıkarır
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  // 5 gün kuralı - UETS'te açılmayan tebligatlar 5. günde otomatik işlenir
  private readonly AUTO_PROCESS_DAYS = 5;

  constructor(private prisma: PrismaService) {}

  /**
   * Tüm Tebligatları Getir
   */
  async findAll(userId: string, filters: { isRead?: boolean; type?: string; page?: number; limit?: number }) {
    const { isRead, type, page = 1, limit = 20 } = filters;

    const where: any = { userId, deletedAt: null };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { case: { select: { id: true, caseNumber: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } }),
    ]);

    return { notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  /**
   * Tek Tebligat Getir
   */
  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: { case: true },
    });

    if (!notification) throw new NotFoundException('Tebligat bulunamadı');
    if (notification.userId !== userId) throw new NotFoundException('Bu tebligata erişim yetkiniz yok');

    return notification;
  }

  /**
   * Okundu İşaretle
   * 
   * Tebligatı okundu olarak işaretler
   * UETS'te açılma tarihi de kaydedilir (5 gün kuralı için)
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Tebligat bulunamadı');
    if (notification.userId !== userId) throw new NotFoundException('Erişim yetkiniz yok');

    const now = new Date();
    return this.prisma.notification.update({
      where: { id },
      data: { 
        isRead: true, 
        readDate: now,
        uetsRead: true, // UETS'te okundu olarak işaretle
        uetsOpenedAt: notification.uetsOpenedAt || now, // Açılma tarihi yoksa şimdiki zamanı kullan
      },
    });
  }

  /**
   * Yıldızla/Yıldızı Kaldır
   */
  async toggleStar(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Tebligat bulunamadı');
    if (notification.userId !== userId) throw new NotFoundException('Erişim yetkiniz yok');

    return this.prisma.notification.update({
      where: { id },
      data: { isStarred: !notification.isStarred },
    });
  }

  /**
   * Okunmamış Sayısı
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } });
  }

  /**
   * Hatırlatıcı Oluştur (Tebligat için)
   * 
   * Tebligat için otomatik hatırlatıcı oluşturur
   * Süre bilgisi varsa deadline tarihine göre hatırlatıcı kurar
   */
  async createReminder(id: string, userId: string, data: { dueDate?: Date; title?: string; notifyTypes?: string[] }) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Tebligat bulunamadı');

    // Süre bilgisi varsa onu kullan, yoksa verilen dueDate'i kullan
    const reminderDueDate = notification.deadline || data.dueDate;

    if (!reminderDueDate) {
      throw new NotFoundException('Hatırlatma tarihi belirlenemedi. Tebligat süre bilgisi içermiyor.');
    }

    return this.prisma.reminder.create({
      data: {
        userId,
        notificationId: id,
        caseId: notification.caseId,
        type: 'DEADLINE' as any,
        title: data.title || notification.title,
        dueDate: reminderDueDate,
        remindAt: new Date(reminderDueDate.getTime() - 24 * 60 * 60 * 1000), // 1 gün önce hatırlat
        notifyTypes: data.notifyTypes ? (data.notifyTypes as any) : ['push', 'email'],
      },
    });
  }

  /**
   * 5 GÜN KURALI - Otomatik İşlenecek Tebligatları Getir
   * 
   * UETS'te açılmamış ve 5. günü geçen tebligatları bulur
   * Bu tebligatlar otomatik olarak indirilip işlenmeli
   * 
   * @param userId - Kullanıcı ID'si
   * @returns Otomatik işlenecek tebligatlar
   */
  async getAutoProcessNotifications(userId: string) {
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - this.AUTO_PROCESS_DAYS * 24 * 60 * 60 * 1000);

    // Koşullar:
    // 1. uetsRead = false (UETS'te açılmamış)
    // 2. sentDate + 5 gün < now (5 gün kuralı geçmiş)
    // 3. uetsProcessed = false (daha önce işlenmemiş)
    return this.prisma.notification.findMany({
      where: {
        userId,
        uetsRead: false,
        uetsProcessed: false,
        sentDate: { lt: fiveDaysAgo },
        deletedAt: null,
      },
      include: { case: { select: { id: true, caseNumber: true } } },
      orderBy: { sentDate: 'asc' },
    });
  }

  /**
   * 5 GÜN KURALI - Otomatik İşle
   * 
   * 5. günü geçen tebligatları otomatik olarak işler
   * 1. Tebligatı "okundu" olarak işaretle
   * 2. AI özet çıkar
   * 3. Hatırlatıcı oluştur
   * 4. Uygun davaya ekle veya yeni dava oluştur
   * 
   * @param notificationId - Tebligat ID'si
   * @param userId - Kullanıcı ID'si
   */
  async autoProcessNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Tebligat bulunamadı');
    if (notification.userId !== userId) throw new NotFoundException('Erişim yetkiniz yok');
    if (notification.uetsProcessed) {
      throw new NotFoundException('Bu tebligat zaten işlenmiş');
    }

    // 5 gün kuralı kontrolü
    if (notification.uetsRead) {
      throw new NotFoundException('Bu tebligat zaten UETS\'te açılmış');
    }

    const now = new Date();
    const sentDate = notification.sentDate || notification.createdAt;
    const autoProcessDate = new Date(sentDate.getTime() + this.AUTO_PROCESS_DAYS * 24 * 60 * 60 * 1000);

    if (now < autoProcessDate) {
      throw new NotFoundException(`Bu tebligat henüz 5 gün kuralına tabi değil. Otomatik işleme: ${autoProcessDate.toLocaleDateString('tr-TR')}`);
    }

    // Tebligatı güncelle - otomatik işlenmiş olarak işaretle
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        uetsRead: true,
        uetsOpenedAt: autoProcessDate, // 5. gün otomatik açılmış kabul et
        uetsProcessed: true,
        isRead: true,
        readDate: now,
      },
    });
  }

  /**
   * UETS'ten Yeni Tebligat Ekle
   * 
   * UETS senkronizasyonu sırasında yeni tebligatları kaydeder
   * 5 gün kuralı için otomatik işleme tarihini hesaplar
   * 
   * @param userId - Kullanıcı ID'si
   * @param data - Tebligat bilgileri
   */
  async createFromUets(userId: string, data: {
    uetsId: string;
    title: string;
    content?: string;
    type: string;
    sentDate?: Date;
    caseId?: string;
  }) {
    // Aynı UETS ID'si ile tebligat var mı kontrol et
    const existing = await this.prisma.notification.findFirst({
      where: { userId, uetsId: data.uetsId },
    });

    if (existing) {
      return existing; // Varsa tekrar ekleme
    }

    // Otomatik işleme tarihini hesapla (sentDate + 5 gün)
    const sentDate = data.sentDate || new Date();
    const autoProcessAt = new Date(sentDate.getTime() + this.AUTO_PROCESS_DAYS * 24 * 60 * 60 * 1000);

    return this.prisma.notification.create({
      data: {
        userId,
        uetsId: data.uetsId,
        title: data.title,
        content: data.content,
        type: data.type as any,
        sentDate,
        caseId: data.caseId,
        uetsAutoProcessAt: autoProcessAt,
        uetsProcessed: false,
        isRead: false,
      },
    });
  }

  /**
   * Tebligatı Davaya Ekle
   * 
   * Tebligatı mevcut bir davaya ekler veya yeni dava oluşturur
   * 
   * @param notificationId - Tebligat ID'si
   * @param caseId - Dava ID'si (null = yeni dava oluştur)
   * @param userId - Kullanıcı ID'si
   */
  async linkToCase(notificationId: string, caseId: string | null, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new NotFoundException('Tebligat bulunamadı');
    if (notification.userId !== userId) throw new NotFoundException('Erişim yetkiniz yok');

    // caseId verilmemişse ve case bilgisi yoksa yeni dava oluştur
    if (!caseId && !notification.caseId) {
      // Yeni dava oluştur (tebligat başlığından dosya numarası çıkarılmaya çalışılır)
      const newCase = await this.prisma.case.create({
        data: {
          userId,
          caseNumber: `TEMPORARY-${Date.now()}`, // Geçici numara, avukat düzeltecek
          subject: notification.title,
          status: 'ACTIVE' as any,
        },
      });
      caseId = newCase.id;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { caseId },
      include: { case: true },
    });
  }
}