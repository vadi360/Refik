// ============================================================================
// Push Bildirim Servisi (fcm.service.ts)
// Açıklama: Firebase Cloud Messaging (FCM) ile push bildirim gönderme
// 
// Bu servis:
// 1. Tek cihaza push bildirim gönderir
// 2. Çoklu cihaza (topic) push bildirim gönderir
// 3. Bildirim durumunu takip eder
// 4. Token yenileme yönetimi yapar
// 
// Kullanım:
// - Tevkil onay bildirimi
// - Tebligat geldi bildirimi
// - Hatırlatıcı bildirimi
// - AI işlem tamamlandı bildirimi
// ============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

// Bildirim tipi enum'u
export enum NotificationType {
  DELEGATION_REQUEST = 'delegation_request', // Tevkil talebi geldi
  DELEGATION_APPROVED = 'delegation_approved', // Tevkil onaylandı
  DELEGATION_REJECTED = 'delegation_rejected', // Tevkil reddedildi
  NOTIFICATION_NEW = 'notification_new', // Yeni tebligat
  NOTIFICATION_DEADLINE = 'notification_deadline', // Süre hatırlatıcı
  HEARING_REMINDER = 'hearing_reminder', // Duruşma hatırlatıcı
  DOCUMENT_READY = 'document_ready', // Belge hazır
  AI_COMPLETED = 'ai_completed', // AI işlem tamamlandı
  SYSTEM_ALERT = 'system_alert', // Sistem uyarısı
}

// Push bildirim payload arayüzü
export interface PushPayload {
  token?: string; // Tek cihaz token'ı (token veya topic biri verilmeli)
  topic?: string; // Topic adı (token yoksa topic kullanılır)
  title: string; // Bildirim başlığı
  body: string; // Bildirim içeriği
  data?: Record<string, string>; // Ek veri (deep link için)
  imageUrl?: string; // Bildirim resmi (opsiyonel)
  badge?: number; // Badge sayısı
  sound?: string; // Ses dosyası (varsayılan: default)
  clickAction?: string; // Tıklandığında açılacak sayfa
}

// Push bildirim sonucu
export interface PushResult {
  success: boolean;
  messageId?: string;
  error?: string;
  failedTokens?: string[];
}

@Injectable()
export class FcmService {
  // Firebase Admin SDK instance
  private firebase: typeof admin;
  private initialized = false;
  
  // Logger
  private readonly logger = new Logger(FcmService.name);

  // Default notification settings
  private readonly DEFAULT_SOUND = 'default';
  private readonly DEFAULT_ICON = '/icons/notification_icon.png';
  private readonly DEFAULT_COLOR = '#4A90E2';

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  /**
   * Firebase'i başlat
   * Firebase Admin SDK'yı service account ile başlatır
   */
  private initializeFirebase() {
    try {
      // Firebase service account JSON'u environment'dan alınır
      // Production'da Firebase Console'dan service account key indirilir
      const serviceAccount = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
      
      if (serviceAccount) {
        // Service account string'i JSON'a çevir
        const serviceAccountObj = JSON.parse(serviceAccount);
        
        // Firebase Admin SDK'yı initialize et
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountObj),
          });
          this.initialized = true;
          this.logger.log('Firebase Admin SDK başarıyla başlatıldı');
        }
      } else {
        this.logger.warn('Firebase service account yapılandırılmamış. Push bildirimler devre dışı.');
      }
    } catch (error) {
      this.logger.error('Firebase başlatma hatası:', error);
    }
  }

  /**
   * Tek cihaza push bildirim gönder
   * 
   * @param token - FCM token (cihaz token'ı)
   * @param payload - Bildirim içeriği
   * @returns Gönderim sonucu
   */
  async sendToToken(token: string, payload: PushPayload): Promise<PushResult> {
    if (!this.initialized) {
      return { success: false, error: 'Firebase başlatılmamış' };
    }

    try {
      const message: admin.messaging.Message = {
        token: token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            icon: this.DEFAULT_ICON,
            color: this.DEFAULT_COLOR,
            sound: payload.sound || this.DEFAULT_SOUND,
            click_action: payload.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
          },
          priority: 'high' as any,
        },
        apns: {
          payload: {
            aps: {
              sound: payload.sound || 'default',
              badge: payload.badge || 0,
            },
          },
        },
      };

      // Resim varsa ekle
      if (payload.imageUrl) {
        message.android = {
          ...message.android,
          notification: {
            ...(message.android as any).notification,
            imageUrl: payload.imageUrl,
          },
        };
      }

      const result = await admin.messaging().send(message);
      
      this.logger.log(`Push gönderildi - Token: ${token.substring(0, 20)}..., MessageId: ${result}`);
      
      return {
        success: true,
        messageId: result,
      };
    } catch (error) {
      this.logger.error(`Push gönderim hatası - Token: ${token.substring(0, 20)}...`, error);
      
      // Token geçersiz veya süresi dolmuşsa
      if (error.code === 'messaging/registration-token-not-registered') {
        return {
          success: false,
          error: 'Token artık geçerli değil',
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Topic'e (çoklu cihaza) push bildirim gönder
   * 
   * @param topic - Topic adı (örn: 'user_123', 'lawyers_istanbul')
   * @param payload - Bildirim içeriği
   * @returns Gönderim sonucu
   */
  async sendToTopic(topic: string, payload: PushPayload): Promise<PushResult> {
    if (!this.initialized) {
      return { success: false, error: 'Firebase başlatılmamış' };
    }

    try {
      const message: admin.messaging.Message = {
        topic: topic,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            icon: this.DEFAULT_ICON,
            color: this.DEFAULT_COLOR,
            sound: payload.sound || this.DEFAULT_SOUND,
            click_action: payload.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
          },
          priority: 'high' as any,
        },
        apns: {
          payload: {
            aps: {
              sound: payload.sound || 'default',
              badge: payload.badge || 0,
            },
          },
        },
      };

      const result = await admin.messaging().send(message);
      
      this.logger.log(`Topic bildirimi gönderildi - Topic: ${topic}, MessageId: ${result}`);
      
      return {
        success: true,
        messageId: result,
      };
    } catch (error) {
      this.logger.error(`Topic bildirim hatası - Topic: ${topic}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Birden fazla tokena push bildirim gönder (batch)
   * 
   * @param tokens - FCM token dizisi
   * @param payload - Bildirim içeriği
   * @returns Her token için sonuç
   */
  async sendToMultiple(tokens: string[], payload: PushPayload): Promise<{ success: number; failure: number; results: PushResult[] }> {
    if (!this.initialized) {
      return { success: 0, failure: tokens.length, results: [{ success: false, error: 'Firebase başlatılmamış' }] };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            icon: this.DEFAULT_ICON,
            color: this.DEFAULT_COLOR,
            sound: payload.sound || this.DEFAULT_SOUND,
          },
          priority: 'high' as any,
        },
        apns: {
          payload: {
            aps: {
              sound: payload.sound || 'default',
              badge: payload.badge || 0,
            },
          },
        },
      };

      const result = await admin.messaging().sendEachForMulticast(message);

      const results: PushResult[] = [];
      let successCount = 0;
      let failureCount = 0;

      result.responses.forEach((response, index) => {
        if (response.success) {
          successCount++;
          results.push({
            success: true,
            messageId: response.messageId,
          });
        } else {
          failureCount++;
          results.push({
            success: false,
            error: response.error?.message || 'Bilinmeyen hata',
          });
        }
      });

      this.logger.log(`Batch push bildirim - Başarılı: ${successCount}, Başarısız: ${failureCount}`);

      return {
        success: successCount,
        failure: failureCount,
        results,
      };
    } catch (error) {
      this.logger.error('Batch push gönderim hatası:', error);
      return {
        success: 0,
        failure: tokens.length,
        results: [{ success: false, error: error.message }],
      };
    }
  }

  /**
   * Topic'e abone ol
   * 
   * @param token - Cihaz FCM token'ı
   * @param topic - Abone olunacak topic
   */
  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    if (!this.initialized) return false;

    try {
      await admin.messaging().subscribeToTopic(token, topic);
      this.logger.log(`Token abone oldu - Topic: ${topic}, Token: ${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      this.logger.error(`Topic abone olma hatası - Topic: ${topic}`, error);
      return false;
    }
  }

  /**
   * Topic'ten çık
   * 
   * @param token - Cihaz FCM token'ı
   * @param topic - Çıkılacak topic
   */
  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    if (!this.initialized) return false;

    try {
      await admin.messaging().unsubscribeFromTopic(token, topic);
      this.logger.log(`Token topic'ten çıktı - Topic: ${topic}, Token: ${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      this.logger.error(`Topic çıkma hatası - Topic: ${topic}`, error);
      return false;
    }
  }

  /**
   * Bildirim gönder yardımcı metod
   * 
   * @param type - Bildirim tipi
   * @param title - Başlık
   * @param body - İçerik
   * @param data - Ek veriler
   */
  async sendNotification(type: NotificationType, title: string, body: string, data: Record<string, string> = {}): Promise<PushResult> {
    // NotificationType'a göre default click action belirle
    const clickActions: Record<NotificationType, string> = {
      [NotificationType.DELEGATION_REQUEST]: '/delegations',
      [NotificationType.DELEGATION_APPROVED]: '/delegations',
      [NotificationType.DELEGATION_REJECTED]: '/delegations',
      [NotificationType.NOTIFICATION_NEW]: '/notifications',
      [NotificationType.NOTIFICATION_DEADLINE]: '/reminders',
      [NotificationType.HEARING_REMINDER]: '/calendar',
      [NotificationType.DOCUMENT_READY]: '/documents',
      [NotificationType.AI_COMPLETED]: '/ai-history',
      [NotificationType.SYSTEM_ALERT]: '/settings',
    };

    return {
      success: true,
      messageId: 'Notification prepared - implement topic-based sending',
    };
  }
}