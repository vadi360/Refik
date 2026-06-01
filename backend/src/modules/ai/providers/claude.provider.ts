// ============================================================================
// Claude Provider (claude.provider.ts)
// Açıklama: Claude AI modeli ile iletişim servisi
// 
// Bu servis:
// 1. Claude API'ye istek gönderir
// 2. Yanıtları işlenmiş formatta döndürür
// 3. Token kullanımını takip eder
// 4. Hata yönetimi yapar
// 
// Kullanım:
// - İçtihat araştırması (legal_research)
// - Karar analizi (decision_analysis)
// - Süre çıkarımı (deadline_extract) - Kritik görevler
// 
// Claude'un Avantajları:
// - Daha doğru hukuki analiz
// - Uzun metinleri iyi işleme
// - Neden-sonuç ilişkisi kurma
// ============================================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

// Claude API Response arayüzü
interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  id: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Claude işlem sonucu arayüzü
interface ProcessResult {
  text: string;
  tokensUsed: number;
  confidence: number;
  metadata: Record<string, any>;
}

// AI işlem isteği arayüzü
interface ProcessRequest {
  taskType: string;
  input: string;
  context?: Record<string, any>;
  settings?: {
    temperature?: number;
    maxTokens?: number;
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

@Injectable()
export class ClaudeProvider {
  // Claude API client'ı
  private client: AxiosInstance;
  
  // API anahtarı ve URL
  private apiKey: string;
  private apiUrl: string;

  // Sistem prompt'ları - Türkçe hukuki terminoloji
  private readonly SYSTEM_PROMPTS: Record<string, string> = {
    // -----------------------------------------------------------------------------
    // TEBLİGAT ÖZETLEME
    // -----------------------------------------------------------------------------
    notification_summary: `Sen bir Türk hukuk asistanısın. Verilen tebligat metnini analiz edip şu bilgileri çıkar:
1. Tebligatın türü (dava, karar, ihtarname, vs.)
2. Gönderen kurum
3. Kritik tarihler ve süreler
4. Önemli noktalar (5 cümle ile özet)
5. Yapılması gerekenler (varsa)

Türkçe yanıt ver.`,

    // -----------------------------------------------------------------------------
    // SÜRE ÇIKARIMI
    // -----------------------------------------------------------------------------
    deadline_extract: `Sen bir Türk hukuk asistanısın. Verilen metinden süre bilgilerini çıkar:
1. Yasal süreler (itiraz, temyiz, vs.)
2. Gün sayısı
3. Başlangıç tarihi (varsa)
4. Bitiş tarihi (hesaplanmış)
5. Sürenin kaçıncı gününde olduğu

Yasal süre hesaplaması yaparken:
- Hafta sonları ve resmi tatilleri dikkate al
- Avukatın bildiği "yargılamanın selameti" kuralını uygula
- Türk Medeni Kanun ve İcra İflas Kanunu hükümlerini kullan

Türkçe yanıt ver.`,

    // -----------------------------------------------------------------------------
    // DOSYA ÖZETİ
    // -----------------------------------------------------------------------------
    case_summary: `Sen bir Türk hukuk asistanısın. Verilen dava bilgilerini analiz edip özetle:
1. Davanın konusu ve tarafları
2. Yargılama süreci (duruşmalar, kararlar)
3. Mevcut durum
4. Kritik noktalar ve riskler
5. Öneriler

Dava no, mahkeme bilgisi, taraflar detaylı belirtilmeli. Türkçe yanıt ver.`,

    // -----------------------------------------------------------------------------
    // KARAR ANALİZİ
    // -----------------------------------------------------------------------------
    decision_analysis: `Sen bir Türk hukuk asistanısın. Verilen mahkeme kararını analiz et:
1. Kararın lehte mi aleyhte mi olduğu (yüzde olarak)
2. Gerekçe özeti
3. Hüküm fıkrası
4. Kararın sonuçları (taraflar için)
5. İçtihat değeri (emsal niteliği)
6. Temyiz veya itiraz yolu (varsa)

Yüksek doğruluk oranı gerektiren kritik bir görevdir. Dikkatli analiz yap. Türkçe yanıt ver.`,

    // -----------------------------------------------------------------------------
    // İÇTİHAT ARAŞTIRMA
    // -----------------------------------------------------------------------------
    legal_research: `Sen bir Türk hukuk asistanısın. Verilen konuda içtihat ve emsal karar araştır:
1. Konu ile ilgili Yargıtay içtihatları
2. Danıştay kararları
3. Anayasa Mahkemesi kararları (varsa)
4. Önemli bilirkişi raporları (varsa)
5. Güncel mevzuat değişiklikleri

Her karar için:
- Karar no ve yılı
- Mahkeme
- Özet
- İlgili mevzuat

Kaynak güvenilir olmalı. Türkçe yanıt ver.`,

    // -----------------------------------------------------------------------------
    // GENEL SORU-CEVAP
    // -----------------------------------------------------------------------------
    general_qa: `Sen bir Türk hukuk asistanısın. Kullanıcının sorusunu yanıtla:
- Hukuki terimleri açıkla
- Yasal süreçleri anlat
- Dikkat edilmesi gereken noktaları belirt
- Türk mevzuatına atıfta bulun

Türkçe, anlaşılır ve doğru yanıt ver. Yanlış bilgi vermekten kaçın.`,
  };

  constructor(private configService: ConfigService) {
    // Claude API yapılandırması
    this.apiKey = this.configService.get<string>('CLAUDE_API_KEY', '');
    this.apiUrl = this.configService.get<string>('CLAUDE_API_URL', 'https://api.anthropic.com/v1/messages');

    // API Client oluştur
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 60000, // 60 saniye timeout
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
    });
  }

  /**
   * AI İsteğini İşle
   * 
   * Gelen isteği Claude API'ye gönderir ve sonucu işler
   * 
   * @param request - AI işlem isteği
   * @returns - İşlenmiş sonuç
   */
  async process(request: ProcessRequest): Promise<ProcessResult> {
    const { taskType, input, context, settings, options } = request;

    // API anahtarı kontrolü
    if (!this.apiKey) {
      throw new BadRequestException('Claude API anahtarı yapılandırılmamış');
    }

    try {
      // Sistem prompt'unu al
      const systemPrompt = this.SYSTEM_PROMPTS[taskType] || this.SYSTEM_PROMPTS['general_qa'];

      // Kullanıcı mesajını oluştur
      const userMessage = this.buildUserMessage(taskType, input, context);

      // Claude API'ye istek gönder
      const response = await this.sendToClaude(
        systemPrompt,
        userMessage,
        {
          temperature: options?.temperature ?? settings?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? settings?.maxTokens ?? 4000,
        },
      );

      // Yanıtı işle
      return this.processResponse(response);
    } catch (error) {
      // Hata durumunda kullanıcı dostu mesaj döndür
      console.error('Claude API Hatası:', error?.response?.data || error.message);
      throw new BadRequestException(`Claude işlemi başarısız: ${error.message}`);
    }
  }

  /**
   * Claude API'ye İstek Gönder
   */
  private async sendToClaude(
    systemPrompt: string,
    userMessage: string,
    options: { temperature: number; maxTokens: number },
  ): Promise<ClaudeResponse> {
    const response = await this.client.post(
      '',
      {
        model: 'claude-sonnet-4-20250514', // Claude 4 Sonnet
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      },
    );

    return response.data;
  }

  /**
   * Kullanıcı Mesajını Oluştur
   */
  private buildUserMessage(taskType: string, input: string, context?: Record<string, any>): string {
    let message = input;

    // Context bilgisi varsa ekle
    if (context) {
      const contextParts: string[] = [];

      // Dosya bilgisi
      if (context.caseId) {
        contextParts.push(`📁 Dosya ID: ${context.caseId}`);
      }

      // Kaynak bilgisi
      if (context.source) {
        contextParts.push(`📌 Kaynak: ${context.source}`);
      }

      // Belge türü
      if (context.documentType) {
        contextParts.push(`📋 Belge Türü: ${context.documentType}`);
      }

      if (contextParts.length > 0) {
        message = `Bağlam:\n${contextParts.join('\n')}\n\n---\n\n${message}`;
      }
    }

    return message;
  }

  /**
   * Claude Yanıtını İşle
   */
  private processResponse(response: ClaudeResponse): ProcessResult {
    // Claude'tan gelen metni çıkar
    const text = response.content?.[0]?.text || '';

    // Toplam token kullanımı
    const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

    // Confidence skoru - Claude'ta bu direkt gelmez, metnin kalitesine göre tahmin edilir
    // Burada basit bir heuristik kullanıyoruz
    const confidence = this.calculateConfidence(text);

    return {
      text,
      tokensUsed,
      confidence,
      metadata: {
        model: response.model,
        id: response.id,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
      },
    };
  }

  /**
   * Güven Skoru Hesapla
   * 
   * Metnin kalitesine göre bir confidence skoru üretir
   * Bu basit bir heuristik - gerçek uygulamada daha sofistike olabilir
   */
  private calculateConfidence(text: string): number {
    if (!text || text.length < 50) return 0.3;

    // Pozitif faktörler
    let score = 0.5; // Base score

    // Yeterli uzunlukta mı?
    if (text.length > 200) score += 0.1;

    // Belirli anahtar kelimeler içeriyor mu?
    const legalTerms = ['mahkeme', 'karar', 'yargıtay', 'danıştay', 'kanun', 'madde', 'fıkra', 'hüküm'];
    const hasLegalTerms = legalTerms.some(term => text.toLowerCase().includes(term));
    if (hasLegalTerms) score += 0.15;

    // Liste içeriyor mu (madde işaretleri)?
    if (text.includes('1.') || text.includes('•') || text.includes('-')) score += 0.1;

    // Negatif faktörler
    // Çok kısa veya anlamsız
    if (text.length < 100) score -= 0.2;

    // Belirsiz ifadeler
    if (text.includes('belirlenemiyor') || text.includes('anlaşılamıyor')) score -= 0.1;

    // 0-1 arasında sınırla
    return Math.min(Math.max(score, 0.1), 1.0);
  }
}