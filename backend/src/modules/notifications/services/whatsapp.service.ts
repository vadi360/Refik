// ============================================================================
// WhatsApp Bildirim Servisi (whatsapp.service.ts)
// Açıklama: WhatsApp Business API ile bildirim gönderme
// 
// Bu servis:
// 1. WhatsApp Business API ile mesaj gönderir
// 2. Template mesajları yönetir
// 3. Görsel/ belge paylaşımı yapar
// 4. Okundu durumunu takip eder
// 
// Kullanım:
// - Tevkil onay bildirimleri
// - Kritik hatırlatıcılar (SMS'e alternatif)
// - Müşteri ile iletişim (gelecek)
// 
// Not: WhatsApp Business API onaylı business hesabı gerektirir
// ============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

// WhatsApp mesaj tipi
export enum WhatsAppMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  TEMPLATE = 'template',
  INTERACTIVE = 'interactive',
}

// WhatsApp Bildirim isteği
export interface WhatsAppRequest {
  to: string; // Telefon numarası (ülke kodu ile: 905...)
  type: WhatsAppMessageType;
  content: {
    body?: string; // Metin içerik
    mediaUrl?: string; // Medya URL'i
    mediaCaption?: string; // Medya alt yazısı
    filename?: string; // Dosya adı (document için)
    templateId?: string; // Template ID
    templateData?: Record<string, string>; // Template değişkenleri
  };
}

// WhatsApp gönderim sonucu
export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class WhatsAppService {
  // WhatsApp Business API URL
  private readonly API_URL = 'https://graph.facebook.com/v18.0';
  
  // WhatsApp Business hesap ID
  private wabaId: string;
  
  // Phone Number ID (gönderen telefon)
  private phoneNumberId: string;
  
  // API Token
  private accessToken: string;
  
  // HTTP client
  private client: AxiosInstance;
  
  // Logger
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private configService: ConfigService) {
    this.wabaId = this.configService.get<string>('WHATSAPP_WABA_ID', '');
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', '');

    this.client = axios.create({
      baseURL: this.API_URL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!this.accessToken) {
      this.logger.warn('WhatsApp API token yapılandırılmamış. WhatsApp bildirimleri devre dışı.');
    }
  }

  /**
   * WhatsApp mesajı gönder
   * 
   * @param request - WhatsApp bildirim isteği
   * @returns Gönderim sonucu
   */
  async sendMessage(request: WhatsAppRequest): Promise<WhatsAppResult> {
    if (!this.accessToken) {
      return { success: false, error: 'WhatsApp API yapılandırılmamış' };
    }

    try {
      const payload = this.buildPayload(request);
      
      const endpoint = `/${this.phoneNumberId}/messages`;
      const response = await this.client.post(endpoint, payload);

      const messageId = response.data.messages?.[0]?.id;
      
      this.logger.log(`WhatsApp mesajı gönderildi - To: ${request.to}, MessageID: ${messageId}`);
      
      return {
        success: true,
        messageId,
      };
    } catch (error) {
      this.logger.error(`WhatsApp mesaj gönderim hatası - To: ${request.to}`, error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Metin mesajı gönder
   * 
   * @param to - Alıcı telefon
   * @param message - Mesaj içeriği
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResult> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: WhatsAppMessageType.TEXT,
      content: { body: message },
    });
  }

  /**
   * Görsel mesajı gönder
   * 
   * @param to - Alıcı telefon
   * @param imageUrl - Görsel URL
   * @param caption - Alt yazı (opsiyonel)
   */
  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<WhatsAppResult> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: WhatsAppMessageType.IMAGE,
      content: { mediaUrl: imageUrl, mediaCaption: caption },
    });
  }

  /**
   * Belge mesajı gönder
   * 
   * @param to - Alıcı telefon
   * @param documentUrl - Belge URL
   * @param filename - Dosya adı
   * @param caption - Açıklama (opsiyonel)
   */
  async sendDocumentMessage(to: string, documentUrl: string, filename: string, caption?: string): Promise<WhatsAppResult> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: WhatsAppMessageType.DOCUMENT,
      content: { mediaUrl: documentUrl, filename, mediaCaption: caption },
    });
  }

  /**
   * Template mesajı gönder
   * 
   * @param to - Alıcı telefon
   * @param templateName - Template adı
   * @param templateData - Template değişkenleri
   */
  async sendTemplateMessage(to: string, templateName: string, templateData: Record<string, string> = {}): Promise<WhatsAppResult> {
    return this.sendMessage({
      to: this.formatPhoneNumber(to),
      type: WhatsAppMessageType.TEMPLATE,
      content: { templateId: templateName, templateData },
    });
  }

  /**
   * Tevkil bildirimi gönder
   * 
   * @param to - Alıcı telefon
   * @param senderName - Gönderen avukat adı
   * @param caseNumber - Dosya numarası
   * @param court - Mahkeme
   */
  async sendDelegationNotification(
    to: string,
    senderName: string,
    caseNumber: string,
    court: string,
  ): Promise<WhatsAppResult> {
    const message = `📋 *AvukatPro - Tevkil Talebi*

Merhaba!

*${senderName}* size bir duruşma tevkili gönderdi.

📁 Dosya: ${caseNumber}
🏛️ Mahkeme: ${court}

Onaylamak veya reddetmek için uygulamayı açın.

AvukatPro - Hukuk Asistanı`;

    return this.sendTextMessage(to, message);
  }

  /**
   * Hatırlatıcı bildirimi gönder
   * 
   * @param to - Alıcı telefon
   * @param title - Hatırlatıcı başlığı
   * @param dueDate - Vade tarihi
   * @param type - Hatırlatıcı türü
   */
  async sendReminderNotification(
    to: string,
    title: string,
    dueDate: string,
    type: string,
  ): Promise<WhatsAppResult> {
    const emoji = type === 'DEADLINE' ? '⚠️' : '📅';
    
    const message = `${emoji} *AvukatPro - Hatırlatma*

*${title}*

📅 Tarih: ${dueDate}
${type === 'DEADLINE' ? '⚡ Kritik: Süre yaklaşıyor!' : ''}

AvukatPro uygulamasını açmak için tıklayın: https://avukatpro.com/app`;

    return this.sendTextMessage(to, message);
  }

  /**
   * Payload oluştur
   * 
   * @param request - WhatsApp isteği
   */
  private buildPayload(request: WhatsAppRequest): any {
    const basePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: request.to,
    };

    switch (request.type) {
      case WhatsAppMessageType.TEXT:
        return {
          ...basePayload,
          type: 'text',
          text: { preview_url: false, body: request.content.body },
        };

      case WhatsAppMessageType.IMAGE:
        return {
          ...basePayload,
          type: 'image',
          image: {
            link: request.content.mediaUrl,
            caption: request.content.mediaCaption,
          },
        };

      case WhatsAppMessageType.DOCUMENT:
        return {
          ...basePayload,
          type: 'document',
          document: {
            link: request.content.mediaUrl,
            filename: request.content.filename,
            caption: request.content.mediaCaption,
          },
        };

      case WhatsAppMessageType.TEMPLATE:
        // Template mesajları için header ve body bileşenleri
        const components: any[] = [];

        // Body component (zorunlu)
        if (request.content.templateData) {
          const bodyParams = Object.values(request.content.templateData);
          components.push({
            type: 'body',
            parameters: bodyParams.map(p => ({ type: 'text', text: String(p) })),
          });
        }

        return {
          ...basePayload,
          type: 'template',
          template: {
            name: request.content.templateId,
            language: { code: 'tr' }, // Türkçe
            components,
          },
        };

      default:
        return basePayload;
    }
  }

  /**
   * Telefon numarasını formatla
   * 
   * @param phone - Telefon numarası
   * @returns Formatlanmış numara (90 ile başlayan)
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    
    if (!cleaned.startsWith('90')) {
      if (cleaned.startsWith('0')) {
        cleaned = '9' + cleaned; // 05xx -> 905xx
      } else {
        cleaned = '90' + cleaned; // 5xx -> 905xx
      }
    }
    
    return cleaned;
  }

  /**
   * Mesaj durumunu sorgula
   * 
   * @param messageId - WhatsApp mesaj ID
   */
  async getMessageStatus(messageId: string): Promise<string> {
    if (!this.accessToken) return 'unknown';

    try {
      const endpoint = `/${messageId}`;
      const response = await this.client.get(endpoint);
      
      return response.data.status || 'unknown';
    } catch (error) {
      this.logger.error(`WhatsApp mesaj durumu sorgulama hatası - MessageID: ${messageId}`, error);
      return 'error';
    }
  }

  /**
   * Webhook alımı (gelen mesajlar için)
   * 
   * WhatsApp Business API'den gelen webhook'ları işler
   * 
   * @param payload - Webhook payload
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      // Webhook doğrulama (GET isteği için)
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            if (change.value?.messages) {
              for (const message of change.value.messages) {
                await this.processIncomingMessage(message);
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('WhatsApp webhook işleme hatası:', error);
    }
  }

  /**
   * Gelen mesajı işle
   * 
   * @param message - WhatsApp mesajı
   */
  private async processIncomingMessage(message: any): Promise<void> {
    this.logger.log(`Gelen WhatsApp mesajı - From: ${message.from}, Type: ${message.type}`);
    
    // TODO: Gelen mesajları veritabanına kaydet veya otomatik yanıt ver
    // Bu kısım uygulama gereksinimlerine göre doldurulacak
  }
}