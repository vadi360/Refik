// ============================================================================
// Minimax Provider (minimax.provider.ts)
// Açıklama: Minimax M2.7 API ile iletişim
// 
// Bu provider:
// 1. Minimax Türkiye sunucusuna istek gönderir
// 2. Token yönetimini yapar
// 3. Hata durumlarını handle eder
// 
// Minimax M2.7 Özellikleri:
// - Türkiye sunucusu (veri Türkiye'de kalır - KVKK uyumlu)
// - Düşük gecikme süresi
// - Uygun maliyet
// - 128K context window
// ============================================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Minimax API response arayüzü
interface MinimaxResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    finish_reason: string;
    messages: {
      role: string;
      content: string;
    }[];
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class MinimaxProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MINIMAX_API_KEY', '');
    this.apiUrl = this.configService.get<string>('MINIMAX_API_URL', 'https://api.minimax.chat/v1');
    this.model = 'Minimax-01'; // Model adı - doğrulanacak
  }

  /**
   * AI İsteğini İşle
   * 
   * @param params - AI isteği parametreleri
   * @returns AI yanıtı
   */
  async process(params: {
    taskType: string;
    input: string;
    context?: Record<string, any>;
    settings?: any;
    options?: { temperature?: number; maxTokens?: number };
  }): Promise<{
    text: string;
    tokensUsed: number;
    confidence: number;
    metadata: Record<string, any>;
  }> {
    // -----------------------------------------------------------------------------
    // GİRİŞ VALİDASYONU
    // -----------------------------------------------------------------------------
    if (!this.apiKey) {
      throw new BadRequestException('Minimax API anahtarı yapılandırılmamış');
    }

    if (!params.input || params.input.trim().length === 0) {
      throw new BadRequestException('AI isteği için metin girilmesi zorunludur');
    }

    // -----------------------------------------------------------------------------
    // SİSTEM MESAJI OLUŞTUR
    // -----------------------------------------------------------------------------
    // Görev tipine göre sistem mesajı oluştur
    const systemMessage = this.getSystemMessage(params.taskType);

    // -----------------------------------------------------------------------------
    // MINIMAX API'YE İSTEK GÖNDER
    // -----------------------------------------------------------------------------
    try {
      const response = await axios.post<MinimaxResponse>(
        `${this.apiUrl}/text/chatcompletion_pro`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: params.input },
          ],
          temperature: params.options?.temperature ?? 0.7,
          max_tokens: params.options?.maxTokens ?? 4000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30 saniye timeout
        },
      );

      // -----------------------------------------------------------------------------
      // YANITI İŞLE
      // -----------------------------------------------------------------------------
      const choice = response.data.choices[0];
      const text = choice?.messages?.[0]?.content || '';

      if (!text) {
        throw new BadRequestException('AI\'dan boş yanıt alındı');
      }

      return {
        text: this.cleanResponse(text),
        tokensUsed: response.data.usage.total_tokens,
        confidence: this.estimateConfidence(text),
        metadata: {
          model: this.model,
          finishReason: choice.finish_reason,
          responseId: response.data.id,
        },
      };
    } catch (error) {
      // Hata durumlarını işle
      if (error.response?.status === 401) {
        throw new BadRequestException('Minimax API anahtarı geçersiz');
      }
      if (error.response?.status === 429) {
        throw new BadRequestException('Minimax API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new BadRequestException('AI isteği zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }

      console.error('Minimax API Error:', error.message);
      throw new BadRequestException(`Minimax API hatası: ${error.message}`);
    }
  }

  /**
   * Sistem Mesajını Getir
   * 
   * Görev tipine göre AI'a verilecek sistem talimatı
   * Bu talimat, AI'ın nasıl yanıt vermesi gerektiğini belirler
   */
  private getSystemMessage(taskType: string): string {
    const messages: Record<string, string> = {
      // Tebligat özetleme - kısa ve net özet
      notification_summary: `
Sen Türk hukuk alanında uzman bir asistanısın. Verilen tebligat metnini analiz edip şu bilgileri çıkar:
1. Tebligatın türü (ara karar, duruşma, süreli bildirim)
2. Kritik bilgiler (tarihler, süreler, kararlar)
3. Özet (en fazla 3 cümle)

Türkçe yanıt ver. Resmi ve net ol.`,
      // Süre çıkarımı - kritik, hata kabul etmez
      deadline_extract: `
Sen Türk hukuk alanında uzman bir asistanısın. Verilen metinden süre bilgisini çıkar.
Türk mevzuatına göre:
- İtiraz süresi: 14 gün (kesin süre)
- Karar düzeltme: 15 gün
- İstinaf: 30 gün

Eğer süre bilgisi bulamazsan "Süre bilgisi bulunamadı" yaz.
Her zaman Türkçe ve net yanıt ver.`,
      // Dosya özeti - kapsamlı
      case_summary: `
Sen Türk hukuk alanında uzman bir asistanısın. Verilen dava bilgilerini analiz edip kapsamlı bir özet çıkar.
Şunları içermeli:
- Davanın konusu ve tarafları
- Mevcut durum (aşama, bekleyen işlemler)
- Kritik tarihler (sonraki duruşma, süreler)
- Son gelişmeler
- Aleyhte/Lehte karar sayısı

Türkçe yanıt ver.`,
      // Karar analizi - kritik
      decision_analysis: `
Sen Türk hukuk alanında uzman bir asistanısın. Verilen mahkeme kararını analiz et.
Belirle:
1. Kararın sonucu (kabul, red, kısmen kabul)
2. Müvekkil açısından değerlendirme (aleyhte/lehte)
3. Gerekçenin özeti

Türkçe yanıt ver. Dürüst ve net ol. Yanlış yorumlama riski varsa belirt.`,
      // Dilekçe üretimi
      document_generate: `
Sen Türk hukuk alanında uzman bir avukatsın. Verilen bilgilerle resmi dilekçe taslağı üret.
Türk hukuk dilekçe formatına uygun olmalı:
- Başlık (mahkeme, taraflar)
- Dava konusu ve talepler
- Gerekçe
- Sonuç ve talep

Türkçe, resmi ve hukuki dilde yaz.`,
      // Dilekçe revizyonu
      document_revise: `
Sen Türk hukuk alanında uzman bir avukatsın. Verilen dilekçeyi revize isteğine göre güncelle.
Revizyon talimatına uygun şekilde değişiklik yap. Diğer kısımları aynı bırak.
Türkçe, resmi ve hukuki dilde yaz.`,
      // İhtarname üretimi
      legal_notice: `
Sen Türk hukuk alanında uzman bir avukatsın. Verilen bilgilerle hukuki ihtarname üret.
İhtarname formatında yazılmalı:
- Taraflar
- Konu
- Talep
- Süre (genellikle 15 gün)
- Sonuç (hukuki yaptırımlar)

Türkçe, resmi ve tehditkar ama hukuki çerçevede yaz.`,
      // İçtihat araştırması - kritik
      legal_research: `
Sen Türk hukuk alanında uzman bir asistanısın. Verilen konuda içtihat ve emsal karar araştır.
Şunları belirt:
1. İlgili mevzuat hükmü
2. Yargıtay içtihatları
3. Önemli emsal kararlar (varsa)
4. Pratik değerlendirme

Türkçe yanıt ver. Kaynak belirt.`,
      // Genel Q&A
      general_qa: `
Sen Türk hukuk alanında uzman bir asistanısın. Kullanıcının sorusunu yanıtla.
Kısa, net ve faydalı yanıt ver. Hukuki terimleri açıkla.
Bilmediğin konuda "Bu konuda emin değilim, daha fazla araştırma gerekli" de.
Türkçe yanıt ver.`,
    };

    return messages[taskType] || messages.general_qa;
  }

  /**
   * Yanıtı Temizle
   * 
   * AI'dan gelen yanıtı temizler (gereksiz karakterler,格式化)
   */
  private cleanResponse(text: string): string {
    // Gereksiz boşlukları temizle
    let cleaned = text.replace(/\n{3,}/g, '\n\n').trim();
    
    // Markdown formatlamasını kaldır (varsa)
    cleaned = cleaned.replace(/```/g, '').trim();
    
    return cleaned;
  }

  /**
   * Güven Skoru Tahmini
   * 
   * Yanıtın güvenilirliğini tahmin eder
   * Basit heuristic - gerçek uygulamada daha sofistike yöntemler kullanılabilir
   */
  private estimateConfidence(text: string): number {
    // Metin uzunluğu kontrolü
    if (text.length < 50) return 0.5;
    
    // Belirli kalıpların varlığı
    const hasLegalTerms = /\b(mahkeme, karar, süre, davacı, davalı, hukuk)\b/i.test(text);
    const hasConclusion = /sonuç|talep|karar|verildi/i.test(text);
    
    // Basit puan hesaplama
    let confidence = 0.7; // Temel güven
    if (hasLegalTerms) confidence += 0.1;
    if (hasConclusion) confidence += 0.1;
    if (text.length > 200) confidence += 0.1;
    
    return Math.min(confidence, 0.99); // Max %99
  }
}