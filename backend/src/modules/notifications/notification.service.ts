// ============================================================================
// Bildirim Servisi (notification.service.ts)
// Açıklama: Çoklu kanal bildirim servisi
// 
// Bu servis:
// 1. Push (FCM), SMS (NetGSM), Email (SendGrid), WhatsApp, Telegram
//    gibi tüm bildirim kanallarını destekler
// 2. Kullanıcının tercih ettiği kanallara bildirim gönderir
// 3. Bildirim şablonlarını yönetir
// 4. Bildirim geçmişini tutar
// 
// Desteklenen Kanallar:
// - Push: Firebase Cloud Messaging (FCM)
// - SMS: NetGSM
// - Email: SendGrid
// - WhatsApp: Twilio/WhatsApp Business API
// - Telegram: Telegram Bot API
// ============================================================================
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from './services/fcm.service';
import { NetgsmService } from './services/netgsm.service';
import { SendgridService } from './services/sendgrid.service';
import { WhatsAppService } from './services/whatsapp.service';

export enum NotificationChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  sent: boolean;
  error?: string;
  messageId?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private fcmService: FcmService,
    private netgsmService: NetgsmService,
    private sendgridService: SendgridService,
    private whatsAppService: WhatsAppService,
  ) {}

  /**
   * Kullanıcıya Bildirim Gönder
   * 
   * Kullanıcının tercih ettiği tüm kanallara bildirim gönderir
   * 
   * @param userId - Kullanıcı ID
   * @param payload - Bildirim içeriği
   * @param channels - Hangi kanallardan gönderilecek (varsayılan: kullanıcı tercihleri)
   */
  async sendToUser(
    userId: string,
    payload: NotificationPayload,
    channels?: NotificationChannel[],
  ): Promise<NotificationResult[]> {
    // Kullanıcı bilgilerini al
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        pushToken: true,
        phone: true,
        email: true,
        whatsappNotif: true,
        telegramId: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    // Bildirim geçmişi oluştur
    const notificationLog = await this.prisma.notificationLog.create({
      data: {
        userId,
        title: payload.title,
        body: payload.body,
        channels: (channels || [NotificationChannel.PUSH, NotificationChannel.EMAIL]) as any,
        priority: payload.priority || NotificationPriority.NORMAL,
      },
    });

    // Kullanılacak kanalları belirle
    const channelsToSend = channels || this.getDefaultChannels(user);

    const results: NotificationResult[] = [];

    // Her kanal için bildirim gönder
    for (const channel of channelsToSend) {
      const result = await this.sendToChannel(user, channel, payload);
      results.push(result);

      // Bildirim kaydını güncelle
      await this.prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          [`${channel}Sent`]: result.sent,
          [`${channel}MessageId`]: result.messageId,
          [`${channel}Error`]: result.error,
        } as any,
      });
    }

    return results;
  }

  /**
   * Çoklu Bildirim Gönder (Toplu)
   * 
   * Birden fazla kullanıcıya aynı bildirimi gönderir
   */
  async sendToUsers(
    userIds: string[],
    payload: NotificationPayload,
    channels?: NotificationChannel[],
  ): Promise<Map<string, NotificationResult[]>> {
    const results = new Map<string, NotificationResult[]>();

    // Paralel olarak gönder
    const promises = userIds.map(async (userId) => {
      const userResults = await this.sendToUser(userId, payload, channels);
      results.set(userId, userResults);
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Broadcast (Tüm Kullanıcılara)
   * 
   * Tüm aktif kullanıcılara bildirim gönderir (admin için)
   */
  async broadcast(
    payload: NotificationPayload,
    channels?: NotificationChannel[],
  ): Promise<{ total: number; sent: number; failed: number }> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    const results = await this.sendToUsers(
      users.map(u => u.id),
      payload,
      channels,
    );

    let sent = 0;
    let failed = 0;

    results.forEach((channelResults) => {
      channelResults.forEach((result) => {
        if (result.sent) sent++;
        else failed++;
      });
    });

    return { total: users.length, sent, failed };
  }

  /**
   * Kanal Başına Bildirim Gönder
   */
  private async sendToChannel(
    user: any,
    channel: NotificationChannel,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    try {
      switch (channel) {
        case NotificationChannel.PUSH:
          return await this.sendPush(user, payload);
        case NotificationChannel.SMS:
          return await this.sendSms(user, payload);
        case NotificationChannel.EMAIL:
          return await this.sendEmail(user, payload);
        case NotificationChannel.WHATSAPP:
          return await this.sendWhatsApp(user, payload);
        case NotificationChannel.TELEGRAM:
          return await this.sendTelegram(user, payload);
        default:
          return { success: false, channel, sent: false, error: 'Bilinmeyen kanal' };
      }
    } catch (error) {
      return { success: false, channel, sent: false, error: error.message };
    }
  }

  /**
   * Push Bildirim Gönder
   */
  private async sendPush(user: any, payload: NotificationPayload): Promise<NotificationResult> {
    if (!user.pushToken) {
      return { success: false, channel: NotificationChannel.PUSH, sent: false, error: 'Push token yok' };
    }

    try {
      const result = await this.fcmService.sendToToken(user.pushToken, {
        title: payload.title,
        body: payload.body,
        data: payload.data,
      });

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        sent: true,
        messageId: result.messageId,
      };
    } catch (error) {
      return { success: false, channel: NotificationChannel.PUSH, sent: false, error: error.message };
    }
  }

  /**
   * SMS Bildirim Gönder
   */
  private async sendSms(user: any, payload: NotificationPayload): Promise<NotificationResult> {
    if (!user.phone) {
      return { success: false, channel: NotificationChannel.SMS, sent: false, error: 'Telefon numarası yok' };
    }

    try {
      const result = await this.netgsmService.sendSms({
        to: user.phone,
        message: `${payload.title}\n${payload.body}`,
      });

      return {
        success: true,
        channel: NotificationChannel.SMS,
        sent: true,
        messageId: result.messageId,
      };
    } catch (error) {
      return { success: false, channel: NotificationChannel.SMS, sent: false, error: error.message };
    }
  }

  /**
   * Email Bildirim Gönder
   */
  private async sendEmail(user: any, payload: NotificationPayload): Promise<NotificationResult> {
    if (!user.email) {
      return { success: false, channel: NotificationChannel.EMAIL, sent: false, error: 'E-posta yok' };
    }

    try {
      await this.sendgridService.sendEmail({
        to: user.email,
        subject: payload.title,
        text: payload.body,
      });

      return {
        success: true,
        channel: NotificationChannel.EMAIL,
        sent: true,
      };
    } catch (error) {
      return { success: false, channel: NotificationChannel.EMAIL, sent: false, error: error.message };
    }
  }

  /**
   * WhatsApp Bildirim Gönder
   */
  private async sendWhatsApp(user: any, payload: NotificationPayload): Promise<NotificationResult> {
    if (!user.whatsappNotif || !user.phone) {
      return { success: false, channel: NotificationChannel.WHATSAPP, sent: false, error: 'WhatsApp aktif değil veya telefon yok' };
    }

    try {
      await this.whatsAppService.sendMessage({
        to: user.phone,
        message: `${payload.title}\n\n${payload.body}`,
      });

      return {
        success: true,
        channel: NotificationChannel.WHATSAPP,
        sent: true,
      };
    } catch (error) {
      return { success: false, channel: NotificationChannel.WHATSAPP, sent: false, error: error.message };
    }
  }

  /**
   * Telegram Bildirim Gönder
   */
  private async sendTelegram(user: any, payload: NotificationPayload): Promise<NotificationResult> {
    if (!user.telegramId) {
      return { success: false, channel: NotificationChannel.TELEGRAM, sent: false, error: 'Telegram ID yok' };
    }

    try {
      // Telegram Bot API kullanarak gönder
      // Bu method config'den Telegram bot token alır
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!telegramBotToken) {
        return { success: false, channel: NotificationChannel.TELEGRAM, sent: false, error: 'Telegram bot token yok' };
      }

      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegramId,
          text: `📬 *${payload.title}*\n\n${payload.body}`,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        return {
          success: true,
          channel: NotificationChannel.TELEGRAM,
          sent: true,
          messageId: data.result.message_id.toString(),
        };
      } else {
        return { success: false, channel: NotificationChannel.TELEGRAM, sent: false, error: data.description };
      }
    } catch (error) {
      return { success: false, channel: NotificationChannel.TELEGRAM, sent: false, error: error.message };
    }
  }

  /**
   * Varsayılan kanalları getir (kullanıcı tercihlerine göre)
   */
  private getDefaultChannels(user: any): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Push her zaman denenir (token varsa)
    if (user.pushToken) {
      channels.push(NotificationChannel.PUSH);
    }

    // Email her zaman denenir (email varsa)
    if (user.email) {
      channels.push(NotificationChannel.EMAIL);
    }

    // SMS sadece yüksek öncelikli bildirimler için
    // Telefon varsa eklenebilir ama şimdilik pasif

    return channels;
  }

  /**
   * Bildirim Şablonu Gönder
   */
  async sendWithTemplate(
    userId: string,
    templateId: string,
    variables: Record<string, string>,
    channels?: NotificationChannel[],
  ): Promise<NotificationResult[]> {
    // Şablonu veritabanından al
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new BadRequestException('Şablon bulunamadı');
    }

    // Değişkenleri değiştir
    let title = template.title;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      title = title.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.sendToUser(userId, { title, body }, channels || (template.channels as NotificationChannel[]));
  }

  /**
   * Kullanıcı Bildirim Tercihlerini Güncelle
   */
  async updatePreferences(
    userId: string,
    preferences: {
      pushEnabled?: boolean;
      smsEnabled?: boolean;
      emailEnabled?: boolean;
      whatsappEnabled?: boolean;
      telegramId?: string;
    },
  ): Promise<void> {
    const updateData: any = {};

    if (preferences.pushEnabled !== undefined) {
      // Push token varsa aktif
    }

    if (preferences.smsEnabled !== undefined) {
      // SMS tercihi
    }

    if (preferences.emailEnabled !== undefined) {
      // Email tercihi
    }

    if (preferences.whatsappEnabled !== undefined) {
      updateData.whatsappNotif = preferences.whatsappEnabled;
    }

    if (preferences.telegramId !== undefined) {
      updateData.telegramId = preferences.telegramId;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * Bildirim Geçmişini Getir
   */
  async getHistory(userId: string, limit = 50): Promise<any[]> {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}