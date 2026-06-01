// ============================================================================
// Cron Servisi (cron.service.ts)
// Açıklama: Zamanlanmış görevler servisi
// 
// Bu servis:
// 1. UETS Tebligat Senkronizasyonu (her 15 dakika)
//    - Tüm aktif UETS oturumları için tebligatları çeker
//    - Yeni tebligatları veritabanına kaydeder
//    - 5 gün kuralına uyanları otomatik işler
// 
// 2. 5 Gün Kuralı Kontrolü (her saat)
//    - Otomatik işlenmesi gereken tebligatları bulur
//    - AI analiz çalıştırır
//    - Hatırlatıcı oluşturur
// 
// 3. Hatırlatıcı Bildirimi Kontrolü (her 5 dakika)
//    - Yaklaşan hatırlatıcıları kontrol eder
//    - Bildirim gönderir (push, email, SMS)
// 
// 4. Tevkil Süre Kontrolü (her saat)
//    - Süresi dolan tevkilleri iptal eder
//    - Bildirim gönderir
// 
// 5. Token Kullanım Raporu (her gün)
//    - Kullanıcıların token kullanımını raporlar
//    - Limit aşımı olanları uyarır
// ============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { UetsService } from '../uets/uets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';
import { RemindersService } from '../reminders/reminders.service';

// Bildirim servisleri
import { FcmService } from '../notifications/services/fcm.service';
import { NetgsmService } from '../notifications/services/netgsm.service';
import { SendgridService } from '../notifications/services/sendgrid.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private uetsService: UetsService,
    private notificationsService: NotificationsService,
    private aiService: AiService,
    private remindersService: RemindersService,
    
    // Bildirim servisleri
    private fcmService: FcmService,
    private netgsmService: NetgsmService,
    private sendgridService: SendgridService,
  ) {}

  /**
   * UETS Tebligat Senkronizasyonu
   * 
   * Her 15 dakikada çalışır
   * Tüm aktif UETS oturumları için tebligatları senkronize eder
   */
  @Cron(CronExpression.EVERY_15_MINUTES)
  async handleUetsSync() {
    this.logger.log('[CRON] UETS senkronizasyonu başladı');

    try {
      // Aktif UETS oturumlarını al
      const activeSessions = await this.prisma.uetsSession.findMany({
        where: { isActive: true },
        include: { user: { select: { id: true, pushToken: true } } },
      });

      this.logger.log(`[CRON] ${activeSessions.length} aktif UETS oturumu bulundu`);

      for (const session of activeSessions) {
        try {
          // Tebligatları çek
          const result = await this.uetsService.fetchNotifications(session.userId);
          
          this.logger.log(
            `[CRON] ${session.user.email} - Yeni: ${result.newCount}, İşlendi: ${result.processedCount}`,
          );
        } catch (error) {
          this.logger.error(`[CRON] UETS senkron hatası (${session.user.email}):`, error);
        }
      }
    } catch (error) {
      this.logger.error('[CRON] UETS senkronizasyon genel hatası:', error);
    }
  }

  /**
   * 5 Gün Kuralı Kontrolü
   * 
   * Her saat çalışır
   * Otomatik işlenmesi gereken (5 gün geçen) tebligatları işler
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleFiveDayRule() {
    this.logger.log('[CRON] 5 gün kuralı kontrolü başladı');

    try {
      const now = new Date();
      
      // 5 gün kuralına uyan tebligatları bul
      // uetsRead = false (henüz açılmamış)
      // uetsProcessed = false (daha önce işlenmemiş)
      // uetsAutoProcessAt <= now (5 gün geçmiş)
      const notificationsToProcess = await this.prisma.notification.findMany({
        where: {
          uetsRead: false,
          uetsProcessed: false,
          uetsAutoProcessAt: { lte: now },
          deletedAt: null,
        },
        include: { user: { select: { id: true, pushToken: true, email: true } } },
      });

      this.logger.log(`[CRON] ${notificationsToProcess.length} tebligat işlenmeyi bekliyor`);

      for (const notification of notificationsToProcess) {
        try {
          // AI analiz çalıştır
          if (notification.content) {
            // Tebligatı analiz et
            const [summary, deadline] = await Promise.all([
              this.aiService.summarizeNotification(notification.content, notification.userId),
              this.aiService.extractDeadline(notification.content, notification.userId),
            ]);

            // Hatırlatıcı oluştur (süre varsa)
            if (deadline.result) {
              const deadlineDays = this.extractDays(deadline.result);
              if (deadlineDays > 0) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + deadlineDays);

                await this.remindersService.create({
                  userId: notification.userId,
                  notificationId: notification.id,
                  caseId: notification.caseId,
                  type: 'DEADLINE' as any,
                  title: `Süre: ${notification.title}`,
                  dueDate,
                  remindAt: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000), // 1 gün önce
                  notifyTypes: ['push', 'email'] as any,
                });
              }
            }

            // Bildirimi güncelle
            await this.prisma.notification.update({
              where: { id: notification.id },
              data: {
                uetsProcessed: true,
                uetsRead: true,
                uetsOpenedAt: notification.uetsAutoProcessAt,
                isRead: true,
                readDate: now,
                aiSummary: summary.result,
                aiConfidence: summary.confidence,
                aiModelUsed: summary.model,
              },
            });

            // Push bildirim gönder
            if (notification.user.pushToken) {
              await this.fcmService.sendToToken(notification.user.pushToken, {
                title: '📋 Yeni Tebligat İşlendi',
                body: notification.title,
                data: { type: 'notification', id: notification.id },
              });
            }

            this.logger.log(`[CRON] Tebligat işlendi: ${notification.id}`);
          }
        } catch (error) {
          this.logger.error(`[CRON] Tebligat işleme hatası (${notification.id}):`, error);
        }
      }
    } catch (error) {
      this.logger.error('[CRON] 5 gün kuralı genel hatası:', error);
    }
  }

  /**
   * Hatırlatıcı Bildirimi Kontrolü
   * 
   * Her 5 dakikada çalışır
   * Yaklaşan hatırlatıcıları kontrol eder ve bildirim gönderir
   */
  @Cron('0 */5 * * * *') // Her 5 dakikada
  async handleReminderNotifications() {
    this.logger.log('[CRON] Hatırlatıcı bildirimi kontrolü başladı');

    try {
      const now = new Date();
      const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

      // 30 dakika içinde yapılacak hatırlatıcıları bul
      const upcomingReminders = await this.prisma.reminder.findMany({
        where: {
          status: 'ACTIVE',
          isCompleted: false,
          remindAt: {
            gte: now,
            lte: in30Minutes,
          },
        },
        include: {
          user: { select: { id: true, pushToken: true, email: true, name: true } },
          case: { select: { id: true, caseNumber: true } },
        },
      });

      this.logger.log(`[CRON] ${upcomingReminders.length} hatırlatıcı bildirilecek`);

      for (const reminder of upcomingReminders) {
        try {
          // Push bildirim
          if (reminder.user.pushToken && reminder.notifyTypes?.includes('push')) {
            await this.fcmService.sendToToken(reminder.user.pushToken, {
              title: `⏰ ${reminder.title}`,
              body: `${reminder.case?.caseNumber || ''} - ${reminder.description || ''}`,
              data: { type: 'reminder', id: reminder.id },
            });
          }

          // E-posta bildirim
          if (reminder.user.email && reminder.notifyTypes?.includes('email')) {
            await this.sendgridService.sendEmail({
              to: reminder.user.email,
              subject: `Refik - Hatırlatma: ${reminder.title}`,
              text: `${reminder.title}\n\nTarih: ${reminder.dueDate.toLocaleString('tr-TR')}\n\n${reminder.description || ''}`,
            });
          }

          // SMS bildirim (kritik hatırlatıcılar için)
          if (reminder.type === 'DEADLINE' && reminder.notifyTypes?.includes('sms')) {
            // TODO: Kullanıcının telefon numarasını al
            // await this.netgsmService.sendReminderSms(phone, reminder.title);
          }

          this.logger.log(`[CRON] Hatırlatıcı bildirildi: ${reminder.id}`);
        } catch (error) {
          this.logger.error(`[CRON] Hatırlatıcı bildirim hatası (${reminder.id}):`, error);
        }
      }
    } catch (error) {
      this.logger.error('[CRON] Hatırlatıcı bildirimi genel hatası:', error);
    }
  }

  /**
   * Tevkil Süre Kontrolü
   * 
   * Her saat çalışır
   * Süresi dolan (24 saat) tevkilleri otomatik iptal eder
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDelegationExpiration() {
    this.logger.log('[CRON] Tevkil süre kontrolü başladı');

    try {
      const now = new Date();

      // Süresi dolan beklemedeki tevkilleri bul
      const expiredDelegations = await this.prisma.delegation.findMany({
        where: {
          status: 'PENDING',
          expiresAt: { lte: now },
          deletedAt: null,
        },
        include: {
          fromUser: { select: { id: true, pushToken: true, email: true } },
          toUser: { select: { id: true, pushToken: true, email: true } },
          case: { select: { id: true, caseNumber: true } },
        },
      });

      this.logger.log(`[CRON] ${expiredDelegations.length} tevkil süresi dolmuş`);

      for (const delegation of expiredDelegations) {
        try {
          // Tevkili iptal et
          await this.prisma.delegation.update({
            where: { id: delegation.id },
            data: { status: 'CANCELLED' },
          });

          // Gönderene bildirim gönder
          if (delegation.fromUser.pushToken) {
            await this.fcmService.sendToToken(delegation.fromUser.pushToken, {
              title: '⚠️ Tevkil Süresi Doldu',
              body: `${delegation.case?.caseNumber || 'Dosya'} - Tevkiliniz 24 saat içinde onaylanmadı ve iptal edildi.`,
              data: { type: 'delegation', id: delegation.id },
            });
          }

          // Audit log
          await this.prisma.auditLog.create({
            data: {
              userId: delegation.fromUserId,
              action: 'DELEGATION_AUTO_CANCELLED',
              entityType: 'delegations',
              entityId: delegation.id,
              newValue: { reason: 'Süre doldu (24 saat)' } as any,
            },
          });

          this.logger.log(`[CRON] Tevkil iptal edildi: ${delegation.id}`);
        } catch (error) {
          this.logger.error(`[CRON] Tevkil iptal hatası (${delegation.id}):`, error);
        }
      }
    } catch (error) {
      this.logger.error('[CRON] Tevkil süre kontrolü genel hatası:', error);
    }
  }

  /**
   * Günlük Token Kullanım Raporu
   * 
   * Her gün gece yarısı çalışır
   * Token limitini aşan kullanıcıları raporlar
   */
  @Cron('0 0 * * *') // Her gece yarısı
  async handleDailyTokenReport() {
    this.logger.log('[CRON] Günlük token raporu başladı');

    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Aboneliklerini kontrol et
      const subscriptions = await this.prisma.subscription.findMany({
        where: { isActive: true },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });

      for (const subscription of subscriptions) {
        // Token kullanımını hesapla
        const usage = await this.prisma.userToken.aggregate({
          where: {
            userId: subscription.userId,
            periodStart: { gte: periodStart },
            periodEnd: { lte: periodEnd },
          },
          _sum: { tokenAmount: true },
        });

        const used = usage._sum.tokenAmount || 0;
        const limit = subscription.tokenLimit;
        const percentage = (used / limit) * 100;

        // %80'i geçtiyse uyar
        if (percentage >= 80) {
          this.logger.warn(
            `[CRON] ${subscription.user.name} - Token kullanımı: %${percentage.toFixed(1)} (${used}/${limit})`,
          );

          // E-posta gönder
          await this.sendgridService.sendEmail({
            to: subscription.user.email,
            subject: 'Refik - Token Kullanım Uyarısı',
            text: `Merhaba ${subscription.user.name},\n\nBu ay token kullanımınız %${percentage.toFixed(0)}'e ulaştı (${used}/${limit} token).\n\nAbonelik paketinizi yükseltmek için profil sayfanızı ziyaret edin.`,
          });
        }
      }
    } catch (error) {
      this.logger.error('[CRON] Token raporu genel hatası:', error);
    }
  }

  /**
   * Yük Dengeleme Kontrolü (Her 6 saat)
   * 
   * Çok fazla aktif tevkili olan avukatları işaretler
   * Yük dengeleme algoritmasını günceller
   */
  @Cron('0 */6 * * *') // Her 6 saatte
  async handleLoadBalancing() {
    this.logger.log('[CRON] Yük dengeleme kontrolü başladı');

    try {
      // Çok fazla aktif tevkili olan avukatları bul (>10)
      const overloadedLawyers = await this.prisma.user.findMany({
        where: {
          receivedDelegations: {
            some: {
              status: { in: ['PENDING', 'APPROVED'] },
            },
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              receivedDelegations: {
                where: { status: { in: ['PENDING', 'APPROVED'] } },
              },
            },
          },
        },
      });

      // Sadece aşırı yüklü olanları logla
      for (const lawyer of overloadedLawyers) {
        if (lawyer._count.receivedDelegations > 10) {
          this.logger.warn(
            `[CRON] ${lawyer.name} - Aşırı yüklü: ${lawyer._count.receivedDelegations} aktif tevkil`,
          );
        }
      }
    } catch (error) {
      this.logger.error('[CRON] Yük dengeleme hatası:', error);
    }
  }

  /**
   * Veritabanı Temizliği (Her Pazar)
   * 
   * Soft delete'li kayıtları temizler
   * Eski audit loglarını arşivler
   */
  @Cron('0 3 * * 0') // Her Pazar gece 3'te
  async handleDatabaseCleanup() {
    this.logger.log('[CRON] Veritabanı temizliği başladı');

    try {
      // 90 günden eski soft delete'li kayıtları bul
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Audit logları kontrol et (sadece son 1 yıl)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const oldAuditLogs = await this.prisma.auditLog.findMany({
        where: { createdAt: { lt: oneYearAgo } },
        select: { id: true },
        take: 1000,
      });

      if (oldAuditLogs.length > 0) {
        // TODO: Gerçek silme işlemi (şimdilik sadece log)
        this.logger.log(`[CRON] ${oldAuditLogs.length} eski audit log bulundu (silinmedi - opsiyonel)`);
      }

      this.logger.log('[CRON] Veritabanı temizliği tamamlandı');
    } catch (error) {
      this.logger.error('[CRON] Veritabanı temizliği hatası:', error);
    }
  }

  /**
   * Yardımcı: Metinden gün sayısını çıkar
   */
  private extractDays(text: string): number {
    const match = text.match(/(\d+)\s*gün/i);
    return match ? parseInt(match[1]) : 0;
  }
}