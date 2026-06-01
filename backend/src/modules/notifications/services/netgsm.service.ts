// ============================================================================
// NetGSM SMS Servisi (netgsm.service.ts)
// Açıklama: NetGSM API ile SMS bildirim gönderme
// 
// NetGSM API Dökümanı: https://docs.netgsm.com.tr/
// 
// Bu servis:
// 1. Tek SMS gönderir
// 2. Çoklu SMS (toplu) gönderir
// 3. SMS durumunu sorgular
// 4. Gönderim raporu alır
// 
// Kullanım:
// - Hatırlatıcı SMS'leri (kritik süreler)
// - Tevkil onay/red SMS'leri
// - Sistem uyarı SMS'leri
// 
// Not: Türk Telekomkurum şirketleri için IYS (İleti Yönetim Sistemi) uyumu gerekli
// ============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

// SMS gönderim tipi
export enum SmsType {
  TURKISH = 1, // Türkçe SMS
  ENGLISH = 2, // İngilizce SMS
  BINARY = 3,  // Binary SMS
  FLASH = 4,   // Flash SMS
}

// SMS durumu enum'u
export enum SmsStatus {
  PENDING = 'pending', // Beklemede
  SENT = 'sent', // Gönderildi
  DELIVERED = 'delivered', // Teslim edildi
  UNDELIVERED = 'undelivered', // Teslim edilemedi
  FAILED = 'failed', // Başarısız
}

// SMS gönderim isteği arayüzü
export interface SmsRequest {
  to: string | string[]; // Alıcı numara(lar) - 05xx formatında
  message: string; // SMS içeriği (max 160 karakter single SMS için)
  sender?: string; // Gönderen başlık (NetGSM'den alınan)
  type?: SmsType; // SMS tipi (varsayılan: TURKISH)
  scheduledAt?: Date; // Planlanmış gönderim zamanı (opsiyonel)
}

// SMS gönderim sonucu
export interface SmsResult {
  success: boolean;
  messageId?: string; // NetGSM mesaj ID'si
  orderId?: string; // Toplu gönderim sipariş ID'si
  error?: string;
  recipients?: {
    phone: string;
    status: 'success' | 'failed';
    error?: string;
  }[];
}

// SMS raporu
export interface SmsReport {
  orderId: string;
  status: SmsStatus;
  total: number;
  delivered: number;
  undelivered: number;
  failed: number;
  submitDate: Date;
  deliverDate?: Date;
}

@Injectable()
export class NetgsmService {
  // NetGSM API URL'leri
  private readonly BASE_URL = 'https://api.netgsm.com.tr';
  private readonly SMS_URL = `${this.BASE_URL}/sms/http/v1`;
  
  // HTTP client
  private client: AxiosInstance;
  
  // Logger
  private readonly logger = new Logger(NetgsmService.name);

  // API credentials (environment'dan alınır)
  private username: string;
  private password: string;
  private defaultSender: string; // Varsayılan gönderen başlık

  constructor(private configService: ConfigService) {
    // NetGSM API credentials
    this.username = this.configService.get<string>('NETGSM_USER', '');
    this.password = this.configService.get<string>('NETGSM_PASS', '');
    this.defaultSender = this.configService.get<string>('NETGSM_ORGINATOR', '');

    // HTTP client oluştur
    this.client = axios.create({
      baseURL: this.BASE_URL,
      timeout: 30000, // 30 saniye timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!this.username || !this.password) {
      this.logger.warn('NetGSM API credentials yapılandırılmamış. SMS servisleri devre dışı.');
    }
  }

  /**
   * Tek SMS gönder
   * 
   * @param request - SMS gönderim isteği
   * @returns Gönderim sonucu
   */
  async sendSms(request: SmsRequest): Promise<SmsResult> {
    if (!this.username || !this.password) {
      return { success: false, error: 'NetGSM API credentials yapılandırılmamış' };
    }

    try {
      // Telefon numarasını formatla (05xx şeklinde)
      const formattedPhones = this.formatPhoneNumbers(Array.isArray(request.to) ? request.to : [request.to]);
      
      // SMS içeriğini kontrol et (max 160 karakter single SMS)
      const message = request.message.substring(0, 160);

      // NetGSM API'ye istek gönder
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('password', this.password);
      params.append('msgid', this.generateMessageId());
      params.append('from', request.sender || this.defaultSender);
      params.append('to', formattedPhones.join(','));
      params.append('text', message);
      params.append('type', String(request.type || SmsType.TURKISH));

      // Planlanmış gönderim varsa ekle
      if (request.scheduledAt) {
        params.append('datetime', this.formatScheduledDate(request.scheduledAt));
      }

      const response = await this.client.post('/sms/send', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const responseText = response.data;

      // NetGSM yanıtını parse et
      // Yanıt formatı: "0 123456789" veya "123456789 0 12345"
      const result = this.parseResponse(responseText);

      if (result.success) {
        this.logger.log(`SMS gönderildi - OrderID: ${result.orderId}, Alıcı: ${formattedPhones.join(', ')}`);
      } else {
        this.logger.error(`SMS gönderim hatası - ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error('SMS gönderim hatası:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toplu SMS gönder
   * 
   * @param requests - SMS gönderim istekleri dizisi
   * @returns Her biri için sonuç
   */
  async sendBulkSms(requests: SmsRequest[]): Promise<SmsResult[]> {
    const results: SmsResult[] = [];

    for (const request of requests) {
      const result = await this.sendSms(request);
      results.push(result);
      
      // Rate limiting - her SMS arasında 100ms bekle
      await this.delay(100);
    }

    return results;
  }

  /**
   * SMS durum sorgula
   * 
   * @param orderId - NetGSM sipariş ID'si
   * @returns SMS durumu
   */
  async getSmsStatus(orderId: string): Promise<SmsReport | null> {
    if (!this.username || !this.password) {
      return null;
    }

    try {
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('password', this.password);
      params.append('orderid', orderId);

      const response = await this.client.get('/sms/report', {
        params: params,
      });

      // Yanıtı parse et ve rapor oluştur
      return this.parseReportResponse(response.data, orderId);
    } catch (error) {
      this.logger.error(`SMS durum sorgulama hatası - OrderID: ${orderId}`, error);
      return null;
    }
  }

  /**
   * Gelen SMS'leri oku (Gelen Kutusu)
   * 
   * NetGSM'in aldığı SMS'leri okur
   * 
   * @returns Gelen SMS'ler
   */
  async getIncomingMessages(): Promise<any[]> {
    if (!this.username || !this.password) {
      return [];
    }

    try {
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('password', this.password);
      params.append('status', 'gelen'); // Gelen SMS'ler

      const response = await this.client.get('/sms/inbox', {
        params: params,
      });

      // XML formatındaki yanıtı parse et
      return this.parseIncomingResponse(response.data);
    } catch (error) {
      this.logger.error('Gelen SMS okuma hatası:', error);
      return [];
    }
  }

  /**
   * SMS içeriğini Maskele (Maskeli SMS)
   * 
   * Türkçe karakter desteği için içerik maskelenir
   * 
   * @param message - SMS içeriği
   * @returns Maskelenmiş içerik
   */
  private maskMessage(message: string): string {
    // Türkçe karakterleri ASCII karşılıklarına çevir
    const turkishMap: Record<string, string> = {
      'Ç': 'C', 'ç': 'c',
      'Ğ': 'G', 'ğ': 'g',
      'İ': 'I', 'ı': 'i',
      'Ö': 'O', 'ö': 'o',
      'Ş': 'S', 'ş': 's',
      'Ü': 'U', 'ü': 'u',
    };

    let masked = message;
    for (const [turkish, ascii] of Object.entries(turkishMap)) {
      masked = masked.replace(new RegExp(turkish, 'g'), ascii);
    }

    return masked;
  }

  /**
   * Telefon numaralarını formatla
   * 
   * 05xx... formatına dönüştürür
   * 
   * @param phones - Telefon numaraları dizisi
   * @returns Formatlanmış numaralar
   */
  private formatPhoneNumbers(phones: string[]): string[] {
    return phones.map(phone => {
      // Tüm özel karakterleri kaldır
      let cleaned = phone.replace(/[^0-9]/g, '');
      
      // 0 ile başlamıyorsa 0 ekle
      if (!cleaned.startsWith('0')) {
        cleaned = '0' + cleaned;
      }
      
      // 10 haneli kontrol (05xxxxxxxxx)
      if (cleaned.length !== 11 || !cleaned.startsWith('0')) {
        throw new Error(`Geçersiz telefon numarası: ${phone}`);
      }
      
      return cleaned;
    });
  }

  /**
   * Benzersiz mesaj ID oluştur
   * 
   * @returns Mesaj ID'si
   */
  private generateMessageId(): string {
    return `AVK${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Planlanmış tarihi NetGSM formatına çevir
   * 
   * @param date - Planlanmış tarih
   * @returns Formatlanmış tarih (YYYYMMDDHHMMSS)
   */
  private formatScheduledDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * NetGSM yanıtını parse et
   * 
   * @param responseText - NetGSM'den gelen yanıt
   * @returns Parse edilmiş sonuç
   */
  private parseResponse(responseText: string): SmsResult {
    // Başarılı yanıt: "0" veya "0 123456789"
    // Başarısız yanıt: "123 Hata açıklaması"
    
    const trimmed = responseText.trim();
    
    if (trimmed.startsWith('0')) {
      const parts = trimmed.split(' ');
      return {
        success: true,
        orderId: parts[1] || parts[0],
        messageId: parts[1] || parts[0],
      };
    } else {
      const errorCode = trimmed.split(' ')[0];
      return {
        success: false,
        error: this.getErrorMessage(errorCode),
      };
    }
  }

  /**
   * SMS rapor yanıtını parse et
   * 
   * @param responseText - XML formatında yanıt
   * @param orderId - Sipariş ID
   * @returns SMS raporu
   */
  private parseReportResponse(responseText: string, orderId: string): SmsReport {
    // XML parse işlemi (basit regex ile)
    const totalMatch = responseText.match(/<total>(\d+)<\/total>/);
    const deliveredMatch = responseText.match(/<delivered>(\d+)<\/delivered>/);
    const undeliveredMatch = responseText.match(/<undelivered>(\d+)<\/undelivered>/);
    const statusMatch = responseText.match(/<status>(\w+)<\/status>/);

    return {
      orderId,
      status: (statusMatch?.[1] as SmsStatus) || SmsStatus.PENDING,
      total: parseInt(totalMatch?.[1] || '0'),
      delivered: parseInt(deliveredMatch?.[1] || '0'),
      undelivered: parseInt(undeliveredMatch?.[1] || '0'),
      failed: 0,
      submitDate: new Date(),
    };
  }

  /**
   * Gelen SMS yanıtını parse et
   * 
   * @param responseText - XML formatında yanıt
   * @returns Gelen SMS'ler dizisi
   */
  private parseIncomingResponse(responseText: string): any[] {
    // XML parse (basit regex ile)
    const messages: any[] = [];
    const msgMatches = responseText.matchAll(/<msg>([\s\S]*?)<\/msg>/g);
    
    for (const msgMatch of msgMatches) {
      const msgXml = msgMatch[1];
      
      const idMatch = msgXml.match(/<id>(\d+)<\/id>/);
      const fromMatch = msgXml.match(/<from>(\d+)<\/from>/);
      const textMatch = msgXml.match(/<text>([\s\S]*?)<\/text>/);
      const dateMatch = msgXml.match(/<date>([\s\S]*?)<\/date>/);
      
      if (idMatch && fromMatch) {
        messages.push({
          id: idMatch[1],
          from: fromMatch[1],
          text: textMatch?.[1] || '',
          date: dateMatch?.[1] || '',
        });
      }
    }
    
    return messages;
  }

  /**
   * Hata koduna göre mesaj döndür
   * 
   * @param errorCode - NetGSM hata kodu
   * @returns Türkçe hata mesajı
   */
  private getErrorMessage(errorCode: string): string {
    const errors: Record<string, string> = {
      '1': 'Geçersiz kullanıcı adı veya şifre',
      '2': 'Maske (başlık) bulunamadı',
      '3': 'Yetersiz kredi',
      '4': 'Geçersiz alıcı numara',
      '5': 'SMS metni boş',
      '6': 'Planlanmış tarih geçmiş',
      '7': 'API erişimi engellendi',
      '8': 'İçerik filtrelendi (kötü kelime)',
      '9': 'Çok fazla alıcı',
      '10': 'Çok fazla istek',
    };
    
    return errors[errorCode] || `Bilinmeyen hata (${errorCode})`;
  }

  /**
   * Gecikme yardımcı metodu
   * 
   * @param ms - Milisaniye
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hatırlatıcı SMS'i gönder
   * 
   * @param phone - Alıcı telefon
   * @param message - SMS içeriği
   */
  async sendReminderSms(phone: string, message: string): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      message: `Refik: ${message}`,
      type: SmsType.TURKISH,
    });
  }

  /**
   * Tevkil bildirimi SMS'i gönder
   * 
   * @param phone - Alıcı telefon
   * @param senderName - Gönderen avukat adı
   * @param caseNumber - Dosya numarası
   */
  async sendDelegationSms(phone: string, senderName: string, caseNumber: string): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      message: `Refik: ${senderName} size bir tevkil talebi gönderdi. Dosya: ${caseNumber}`,
      type: SmsType.TURKISH,
    });
  }
}