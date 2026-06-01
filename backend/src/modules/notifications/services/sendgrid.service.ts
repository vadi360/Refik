// ============================================================================
// SendGrid Email Servisi (sendgrid.service.ts)
// Açıklama: SendGrid API ile e-posta bildirim gönderme
// 
// SendGrid API Dökümanı: https://docs.sendgrid.com/
// 
// Bu servis:
// 1. Tek e-posta gönderir
// 2. Toplu e-posta gönderir (batch)
// 3. E-posta şablonları kullanır
// 4. Takvim davetiyeleri (ICS) gönderir
// 5. E-posta durumunu takip eder
// 
// Kullanım:
// - Kayıt doğrulama e-postaları
// - Şifre sıfırlama linkleri
// - AI işlem tamamlandı bildirimleri
// - Haftalık özet e-postaları
// - Sistem bildirimleri
// ============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

// Email tipi enum'u
export enum EmailType {
  VERIFICATION = 'verification', // E-posta doğrulama
  PASSWORD_RESET = 'password_reset', // Şifre sıfırlama
  WELCOME = 'welcome', // Hoş geldin e-postası
  NOTIFICATION_DIGEST = 'notification_digest', // Günlük tebligat özeti
  DELEGATION_ALERT = 'delegation_alert', // Tevkil bildirimi
  AI_COMPLETED = 'ai_completed', // AI işlem tamamlandı
  SUBSCRIPTION_ALERT = 'subscription_alert', // Abonelik uyarısı
  SYSTEM_ALERT = 'system_alert', // Sistem uyarısı
  WEEKLY_REPORT = 'weekly_report', // Haftalık rapor
}

// Email gönderim isteği arayüzü
export interface EmailRequest {
  to: string | string[]; // Alıcı e-posta adres(ler)i
  subject: string; // E-posta konusu
  html?: string; // HTML içerik
  text?: string; // Düz metin içerik
  templateId?: string; // SendGrid template ID
  dynamicData?: Record<string, any>; // Template değişkenleri
  attachments?: {
    content: string; // Base64 encoded
    filename: string;
    type?: string;
    disposition?: string;
  }[];
  scheduledAt?: Date; // Planlanmış gönderim
}

// Email gönderim sonucu
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rejectedEmails?: string[];
}

// Email şablonu arayüzü
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  variables: string[]; // Gerekli değişkenler
  html: string; // Şablon HTML'i
}

@Injectable()
export class SendgridService {
  // SendGrid API key
  private apiKey: string;
  
  // From email (gönderen adresi)
  private fromEmail: string;
  private fromName: string;
  
  // Logger
  private readonly logger = new Logger(SendgridService.name);

  constructor(private configService: ConfigService) {
    // SendGrid API credentials
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY', '');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL', 'noreply@refik.app');
    this.fromName = this.configService.get<string>('SENDGRID_FROM_NAME', 'Refik');

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
      this.logger.log('SendGrid API başarıyla yapılandırıldı');
    } else {
      this.logger.warn('SendGrid API key yapılandırılmamış. E-posta servisleri devre dışı.');
    }
  }

  /**
   * Tek e-posta gönder
   * 
   * @param request - Email gönderim isteği
   * @returns Gönderim sonucu
   */
  async sendEmail(request: EmailRequest): Promise<EmailResult> {
    if (!this.apiKey) {
      return { success: false, error: 'SendGrid API key yapılandırılmamış' };
    }

    try {
      // Alıcıları normalize et (dizi veya tek)
      const toAddresses = this.normalizeRecipients(request.to);

      // Email payload oluştur
      const msg: sgMail.MailDataRequired = {
        to: toAddresses,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: request.subject,
        text: request.text || '',
        html: request.html || '',
      };

      // Template kullanılacaksa
      if (request.templateId) {
        (msg as any).templateId = request.templateId;
        (msg as any).dynamicTemplateData = request.dynamicData || {};
      }

      // Ekler (attachments) varsa ekle
      if (request.attachments && request.attachments.length > 0) {
        msg.attachments = request.attachments.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.type || 'application/octet-stream',
          disposition: att.disposition || 'attachment',
        }));
      }

      // Planlanmış gönderim varsa
      if (request.scheduledAt) {
        (msg as any).sendAt = Math.floor(request.scheduledAt.getTime() / 1000);
      }

      // E-postayı gönder
      const response = await sgMail.send(msg);
      
      const messageId = response[0]?.headers?.['x-message-id'] as string;
      
      this.logger.log(`E-posta gönderildi - To: ${toAddresses.map((t: any) => t.email).join(', ')}, MessageID: ${messageId}`);
      
      return {
        success: true,
        messageId: messageId || response[0]?.headers?.['x-message-id'],
      };
    } catch (error) {
      this.logger.error('E-posta gönderim hatası:', error);
      
      // SendGrid hata kontrolü
      if (error.response?.body?.errors) {
        const errors = error.response.body.errors;
        return {
          success: false,
          error: errors[0]?.message || error.message,
          rejectedEmails: errors.filter((e: any) => e.field === 'to').map((e: any) => e.value),
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * E-posta şablonu kullanarak gönder
   * 
   * @param templateId - SendGrid template ID
   * @param to - Alıcı
   * @param subject - Konu
   * @param data - Template değişkenleri
   */
  async sendWithTemplate(
    templateId: string,
    to: string,
    subject: string,
    data: Record<string, any>,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject,
      templateId,
      dynamicData: data,
    });
  }

  /**
   * Toplu e-posta gönder (batch)
   * 
   * @param requests - Email gönderim istekleri dizisi
   * @returns Her biri için sonuç
   */
  async sendBatchEmails(requests: EmailRequest[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const request of requests) {
      const result = await this.sendEmail(request);
      results.push(result);
      
      // Rate limiting - her email arasında 100ms bekle (SendGrid limit: 1000/min)
      await this.delay(100);
    }

    return results;
  }

  /**
   * E-posta doğrulama linki gönder
   * 
   * @param to - Alıcı e-posta
   * @param name - Kullanıcı adı
   * @param verificationToken - Doğrulama token'ı
   */
  async sendVerificationEmail(to: string, name: string, verificationToken: string): Promise<EmailResult> {
    const verificationUrl = `${this.configService.get<string>('APP_URL')}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Refik - E-posta Doğrulama</h1>
        <p>Merhaba ${name},</p>
        <p>Refik hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            E-postamı Doğrula
          </a>
        </p>
        <p>Bu link 24 saat içinde geçerlidir.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Refik - Türkiye'nin Hukuk Asistanı<br>
          Bu e-postayı aldıysanız, hesabınızda bir doğrulama talep edildi. Eğer bu siz değilseniz, bu maili görmezden gelin.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Refik - E-posta Adresinizi Doğrulayın',
      html,
      text: `Merhaba ${name},\n\nE-posta adresinizi doğrulamak için şu linke tıklayın: ${verificationUrl}\n\nBu link 24 saat içinde geçerlidir.`,
    });
  }

  /**
   * Şifre sıfırlama linki gönder
   * 
   * @param to - Alıcı e-posta
   * @param name - Kullanıcı adı
   * @param resetToken - Sıfırlama token'ı
   */
  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<EmailResult> {
    const resetUrl = `${this.configService.get<string>('APP_URL')}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E24A4A;">Refik - Şifre Sıfırlama</h1>
        <p>Merhaba ${name},</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #E24A4A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Şifremi Sıfırla
          </a>
        </p>
        <p>Bu link 1 saat içinde geçerlidir.</p>
        <p>Eğer şifre sıfırlama talebi etmediyseniz, bu maili görmezden gelin ve hesabınızı kontrol edin.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Refik - Türkiye'nin Hukuk Asistanı
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Refik - Şifrenizi Sıfırlayın',
      html,
      text: `Merhaba ${name},\n\nŞifrenizi sıfırlamak için şu linke tıklayın: ${resetUrl}\n\nBu link 1 saat içinde geçerlidir.`,
    });
  }

  /**
   * Tebligat özeti e-postası gönder
   * 
   * @param to - Alıcı e-posta
   * @param name - Kullanıcı adı
   * @param notifications - Tebligat özetleri
   */
  async sendNotificationDigest(
    to: string,
    name: string,
    notifications: { title: string; type: string; date: string; deadline?: string }[],
  ): Promise<EmailResult> {
    const notificationsHtml = notifications
      .map(n => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">
            <span style="background-color: ${this.getNotificationTypeColor(n.type)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${n.type}
            </span>
          </td>
          <td style="padding: 12px;">
            <strong>${n.title}</strong>
            <br><span style="color: #666;">${n.date}</span>
            ${n.deadline ? `<br><span style="color: #E24A4A;">Süre: ${n.deadline}</span>` : ''}
          </td>
        </tr>
      `)
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Refik - Günlük Tebligat Özeti</h1>
        <p>Merhaba ${name},</p>
        <p>Bugün ${notifications.length} yeni tebligatınız var:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${notificationsHtml}
        </table>
        
        <p style="margin-top: 20px;">
          <a href="${this.configService.get<string>('APP_URL')}/notifications" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Tüm Tebligatları Gör
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Refik - Türkiye'nin Hukuk Asistanı<br>
          Bu emaili artık almak istemiyorsanız, <a href="${this.configService.get<string>('APP_URL')}/settings">bildirim ayarlarınızı</a> değiştirin.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Refik - ${notifications.length} Yeni Tebligatınız Var`,
      html,
    });
  }

  /**
   * AI işlem tamamlandı bildirimi
   * 
   * @param to - Alıcı e-posta
   * @param name - Kullanıcı adı
   * @param taskType - AI görev tipi
   * @param resultSummary - Sonuç özeti
   */
  async sendAiCompletedEmail(
    to: string,
    name: string,
    taskType: string,
    resultSummary: string,
  ): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Refik - AI İşlemi Tamamlandı</h1>
        <p>Merhaba ${name},</p>
        <p><strong>${this.getTaskTypeName(taskType)}</strong> göreviniz tamamlandı.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong>Sonuç Özeti:</strong>
          <p>${resultSummary}</p>
        </div>
        
        <p style="margin-top: 20px;">
          <a href="${this.configService.get<string>('APP_URL')}/ai-history" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Detayları Gör
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Refik - Türkiye'nin Hukuk Asistanı
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Refik - ${this.getTaskTypeName(taskType)} Tamamlandı`,
      html,
    });
  }

  /**
   * Alıcıları normalize et
   * 
   * @param to - Alıcı (dizi veya tek string)
   * @returns Normalize edilmiş adresler
   */
  private normalizeRecipients(to: string | string[]): { email: string; name?: string }[] {
    if (Array.isArray(to)) {
      return to.map(email => ({ email: email.trim() }));
    }
    return [{ email: to.trim() }];
  }

  /**
   * Bildirim tipine göre renk döndür
   */
  private getNotificationTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'DECISION': '#E24A4A',
      'HEARING': '#4A90E2',
      'DEADLINE': '#F5A623',
      'DELEGATION': '#7B68EE',
      'SYSTEM': '#666',
    };
    return colors[type] || '#4A90E2';
  }

  /**
   * Görev tipine göre isim döndür
   */
  private getTaskTypeName(taskType: string): string {
    const names: Record<string, string> = {
      'notification_summary': 'Tebligat Özetleme',
      'deadline_extract': 'Süre Çıkarımı',
      'case_summary': 'Dosya Özeti',
      'decision_analysis': 'Karar Analizi',
      'document_generate': 'Dilekçe Üretimi',
      'document_revise': 'Dilekçe Revizyonu',
      'legal_notice': 'İhtarname Üretimi',
      'legal_research': 'İçtihat Araştırması',
      'general_qa': 'Genel Soru-Cevap',
    };
    return names[taskType] || taskType;
  }

  /**
   * Gecikme yardımcı metodu
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}