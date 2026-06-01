// ============================================================================
// UETS Servisi (uets.service.ts)
// Açıklama: PTT UETS entegrasyonu servisi
// 
// Bu servis:
// 1. UETS oturum yönetimi (bağlantı/bağlantı kesme)
// 2. Tebligatları UETS'ten çeker
// 3. 5 GÜN KURALI otomasyonu:
//    - Açılmamış tebligatları 5. günde otomatik işler
//    - Açılmış tebligatları hemen işler
// 4. AI analiz ve özet çıkarma
// 5. Otomatik dosyalama ve hatırlatıcı oluşturma
// 
// UETS (Ulusal Elektronik Tebligat Sistemi):
// - PTT tarafından işletilen resmi tebligat sistemi
// - Türkiye'deki tüm resmi yazışmalar bu sistemden yapılır
// - 5 gün kuralı: Açılmayan tebligatlar 5. gün otomatik açılmış sayılır
// 
// UETS API:
// - Resmi API yok, WebView + HTML parsing veya scraping gerekiyor
// - Bu servis WebView oturum yönetimi + gerçek çekme mantığını içerir
// ============================================================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';

// UETS bildirim yapısı
interface UetsNotification {
  id: string; // UETS'teki tebligat ID'si
  subject: string; // Başlık
  content?: string; // İçerik özeti
  type: string; // Tebligat türü
  sentDate: Date; // Gönderim tarihi
  sender: string; // Gönderen
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

// UETS oturum durumu
interface UetsSessionInfo {
  loggedIn: boolean;
  lastCheck: Date;
  unreadCount: number;
}

@Injectable()
export class UetsService {
  // UETS WebView URL'i
  private readonly UETS_WEB_URL = 'https://uyap.uyap.gov.tr';
  
  // Otomatik kontrol aralığı (dakika)
  private readonly AUTO_CHECK_INTERVAL_MINUTES = 15;
  
  // 5 gün kuralı (gün olarak)
  private readonly AUTO_PROCESS_DAYS = 5;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private aiService: AiService,
  ) {}

  /**
   * UETS Bağlantısı Kur
   * 
   * Avukatın UETS kimlik bilgilerini kaydeder ve oturum başlatır
   * WebView'de giriş yapıldıktan sonra bu metod çağrılır
   * 
   * @param userId - Kullanıcı ID'si
   * @param credentials - UETS giriş bilgileri { username, password }
   * @returns Oturum bilgileri
   */
  async connect(userId: string, credentials: { username: string; password: string }) {
    // Mevcut oturumu kontrol et
    const existing = await this.prisma.uetsSession.findUnique({
      where: { userId },
    });

    if (existing) {
      // Oturumu güncelle
      const updated = await this.prisma.uetsSession.update({
        where: { userId },
        data: {
          encryptedCredentials: this.encrypt(JSON.stringify(credentials)),
          isActive: true,
          sessionData: { lastLogin: new Date().toISOString() } as any,
        },
      });

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'UETS_CONNECT',
          entityType: 'uets_sessions',
          entityId: updated.id,
        },
      });

      return { success: true, message: 'UETS bağlantısı güncellendi', sessionId: updated.id };
    }

    // Yeni oturum oluştur
    const session = await this.prisma.uetsSession.create({
      data: {
        userId,
        encryptedCredentials: this.encrypt(JSON.stringify(credentials)),
        isActive: true,
        sessionData: {
          lastLogin: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 dakika
        } as any,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UETS_CONNECT',
        entityType: 'uets_sessions',
        entityId: session.id,
      },
    });

    return { success: true, message: 'UETS bağlantısı kuruldu', sessionId: session.id };
  }

  /**
   * UETS Bağlantısını Kes
   * 
   * Oturumu kapatır ve temizler
   */
  async disconnect(userId: string) {
    const session = await this.prisma.uetsSession.findUnique({
      where: { userId },
    });

    if (!session) {
      throw new NotFoundException('UETS bağlantısı bulunamadı');
    }

    await this.prisma.uetsSession.update({
      where: { userId },
      data: { isActive: false },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UETS_DISCONNECT',
        entityType: 'uets_sessions',
        entityId: session.id,
      },
    });

    return { success: true, message: 'UETS bağlantısı kesildi' };
  }

  /**
   * UETS Durumunu Getir
   */
  async getStatus(userId: string) {
    const session = await this.prisma.uetsSession.findUnique({
      where: { userId },
    });

    if (!session || !session.isActive) {
      return { connected: false };
    }

    return {
      connected: session.isActive,
      lastSyncAt: session.lastSyncAt,
      // Session expiry kontrolü
      sessionValid: this.isSessionValid(session.sessionData as any),
    };
  }

  /**
   * UETS Tebligatlarını Çek
   * 
   * UETS'ten tebligat listesini çeker
   * Bu metod WebView veya API üzerinden çağrılır
   * 
   * @param userId - Kullanıcı ID'si
   * @returns Çekilen tebligatlar
   */
  async fetchNotifications(userId: string): Promise<{
    notifications: UetsNotification[];
    newCount: number;
    processedCount: number;
  }> {
    const session = await this.prisma.uetsSession.findUnique({
      where: { userId },
    });

    if (!session || !session.isActive) {
      throw new BadRequestException('UETS bağlantısı aktif değil');
    }

    // ═══════════════════════════════════════════════════════════════
    // UETS'TEN TEBLİGAT ÇEKME
    // Bu kısım gerçek UETS entegrasyonu gerektirir
    // Seçenek 1: WebView'den data çekme (Chrome eklentisi)
    // Seçenek 2: UETS HTML scraping
    // Seçenek 3: Resmi API açılırsa kullanma
    // ═══════════════════════════════════════════════════════════════
    
    // Şimdilik placeholder - gerçek implementasyon için
    // UETS'in HTML'ini parse etmemiz gerekiyor
    const notifications = await this.parseUetsNotifications(session);

    // Son senkronizasyon zamanını güncelle
    await this.prisma.uetsSession.update({
      where: { userId },
      data: { lastSyncAt: new Date() },
    });

    // Her tebligatı işle
    let newCount = 0;
    let processedCount = 0;

    for (const notification of notifications) {
      const result = await this.processNotification(userId, notification);
      if (result.isNew) newCount++;
      if (result.processed) processedCount++;
    }

    return { notifications, newCount, processedCount };
  }

  /**
   * UETS'ten Tebligatları Parse Et
   * 
   * UETS WebView'den veya API'den gelen verileri parse eder
   * Bu metod override edilebilir (farklı scraping yöntemleri için)
   */
  private async parseUetsNotifications(session: any): Promise<UetsNotification[]> {
    // TODO: Gerçek UETS scraping implementasyonu
    // Bu kısım WebView'den veya UETS HTML'inden veri çeker
    
    /*
    // Örnek implementasyon:
    const credentials = JSON.parse(this.decrypt(session.encryptedCredentials));
    
    // UETS web sayfasına giriş yap
    const page = await this.browser.newPage();
    await page.goto(this.UETS_WEB_URL);
    await page.fill('#username', credentials.username);
    await page.fill('#password', credentials.password);
    await page.click('#loginButton');
    await page.waitForSelector('.notification-list');
    
    // Tebligat listesini çek
    const notifications = await page.evaluate(() => {
      const items = document.querySelectorAll('.notification-item');
      return Array.from(items).map(item => ({
        id: item.dataset.id,
        subject: item.querySelector('.subject').textContent,
        sentDate: new Date(item.dataset.date),
        type: item.dataset.type,
      }));
    });
    */

    console.log('[TODO] UETS tebligatları gerçek API'den çekilecek');
    
    return [];
  }

  /**
   * Tebligatı İşle
   * 
   * Her UETS tebligatini veritabanına kaydeder ve 5 gün kuralına göre işler
   */
  private async processNotification(
    userId: string,
    notification: UetsNotification,
  ): Promise<{ isNew: boolean; processed: boolean }> {
    // Tebligat zaten var mı kontrol et
    const existing = await this.prisma.notification.findFirst({
      where: { userId, uetsId: notification.id },
    });

    if (existing) {
      // Varsa güncelle (UETS'te okundu/okunmadı değişmiş olabilir)
      await this.prisma.notification.update({
        where: { id: existing.id },
        data: {
          title: notification.subject,
          // Diğer güncellenebilir alanlar...
        },
      });
      return { isNew: false, processed: false };
    }

    // ═══════════════════════════════════════════════════════════════
    // YENİ TEBLİGAT - VERİTABANINA KAYDET
    // ═══════════════════════════════════════════════════════════════
    
    const sentDate = new Date(notification.sentDate);
    const autoProcessDate = new Date(sentDate.getTime() + this.AUTO_PROCESS_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Otomatik işleme tarihini hesapla (5 gün sonra)
    const shouldAutoProcess = now >= autoProcessDate;

    // Yeni tebligat oluştur
    const newNotification = await this.prisma.notification.create({
      data: {
        userId,
        uetsId: notification.id,
        type: this.mapUetsType(notification.type),
        title: notification.subject,
        content: notification.content,
        sentDate,
        isRead: false,
        uetsRead: false,
        uetsProcessed: shouldAutoProcess, // 5 gün geçtiyse otomatik işlenmiş sayılır
        uetsAutoProcessAt: autoProcessDate,
        // Dosya numarası çıkarılmaya çalışılır
        // caseId sonra eşleştirilir
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // 5 GÜN KURALI OTOMASYONU
    // ═══════════════════════════════════════════════════════════════
    
    if (shouldAutoProcess) {
      // 5 gün geçti - otomatik işle
      await this.autoProcessNotification(newNotification.id, userId);
      return { isNew: true, processed: true };
    }

    return { isNew: true, processed: false };
  }

  /**
   * Tebligatı Otomatik İşle (5 gün kuralı)
   * 
   * AI analiz çalıştırır, özet çıkarır, hatırlatıcı oluşturur
   */
  private async autoProcessNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.uetsProcessed) {
      return;
    }

    // AI analiz çalıştır
    if (notification.content) {
      try {
        // AI özet çıkar
        const summary = await this.aiService.summarizeNotification(
          notification.content,
          userId,
        );

        // Süre çıkarımı yap
        const deadline = await this.aiService.extractDeadline(
          notification.content,
          userId,
        );

        // Bildirimi güncelle
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: {
            uetsProcessed: true,
            uetsRead: true,
            uetsOpenedAt: notification.uetsAutoProcessAt,
            isRead: true,
            readDate: notification.uetsAutoProcessAt,
            aiSummary: summary.result,
            aiConfidence: summary.confidence,
            aiModelUsed: summary.model,
            // Deadline bilgileri ayrı alanlara kaydedilir
          },
        });

        // Hatırlatıcı oluştur (süre varsa)
        if (deadline.result) {
          const deadlineMatch = deadline.result.match(/(\d+)\s*gün/i);
          if (deadlineMatch) {
            const days = parseInt(deadlineMatch[1]);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + days);

            await this.prisma.reminder.create({
              data: {
                userId,
                notificationId,
                type: 'DEADLINE' as any,
                title: `Süre: ${notification.title}`,
                dueDate,
                remindAt: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000), // 1 gün önce
                notifyTypes: ['push', 'email'] as any,
                status: 'ACTIVE' as any,
              },
            });
          }
        }
      } catch (error) {
        console.error('AI analiz hatası:', error);
      }
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UETS_NOTIFICATION_AUTO_PROCESSED',
        entityType: 'notifications',
        entityId: notificationId,
      },
    });
  }

  /**
   * Manuel Senkron Çalıştır
   * 
   * 5 gün kuralına uymayan tebligatları da zorla senkron eder
   */
  async manualSync(userId: string) {
    // Tüm işlenmemiş tebligatları al
    const unprocessed = await this.prisma.notification.findMany({
      where: {
        userId,
        uetsProcessed: false,
        deletedAt: null,
      },
    });

    let processed = 0;

    for (const notification of unprocessed) {
      // UETS'ten güncel durumunu kontrol et
      // (açıldı mı, açılmadı mı)
      const isOpened = await this.checkIfOpened(notification.uetsId);
      
      if (isOpened || notification.uetsAutoProcessAt <= new Date()) {
        await this.autoProcessNotification(notification.id, userId);
        processed++;
      }
    }

    // Son senkron zamanını güncelle
    await this.prisma.uetsSession.update({
      where: { userId },
      data: { lastSyncAt: new Date() },
    });

    return {
      message: `${processed} tebligat işlendi`,
      processed,
      remaining: unprocessed.length - processed,
    };
  }

  /**
   * UETS'te Açıldı mı Kontrol Et
   * 
   * WebView veya API üzerinden tebligatın açılıp açılmadığını kontrol eder
   */
  private async checkIfOpened(uetsId: string): Promise<boolean> {
    // TODO: Gerçek UETS kontrolü
    // Bu kısım UETS'in açık olup olmadığını kontrol eder
    return false;
  }

  /**
   * UETS Türünü Bizim Türümüze Çevir
   */
  private mapUetsType(uetsType: string): string {
    const typeMap: Record<string, string> = {
      'KARAR': 'DECISION',
      'DURUSMA': 'HEARING',
      'İTİRAZ': 'DEADLINE',
      'İHBARNAME': 'LEGAL_NOTICE',
      'TEBLİGAT': 'SYSTEM',
      'YAZI': 'CORRESPONDENCE',
    };

    const normalized = uetsType?.toUpperCase() || '';
    for (const [key, value] of Object.entries(typeMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    return 'SYSTEM';
  }

  /**
   * Oturum Geçerli mi Kontrol Et
   */
  private isSessionValid(sessionData: any): boolean {
    if (!sessionData?.expiresAt) return false;
    return new Date(sessionData.expiresAt) > new Date();
  }

  /**
   * Şifrele
   */
  private encrypt(data: string): string {
    // TODO: Gerçek şifreleme (AES-256)
    // Şimdilik basit Base64
    return Buffer.from(data).toString('base64');
  }

  /**
   * Çöz
   */
  private decrypt(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
}