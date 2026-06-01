// ============================================================================
// AI Servisi (ai.service.ts)
// Açıklama: AI yönlendirme ve işlem servisleri
// 
// Bu servis:
// 1. Gelen AI isteklerini uygun AI modeline yönlendirir
// 2. ai_config tablosundan hangi modelin kullanılacağını okur
// 3. Seçilen provider'ı çağırır ve sonucu döndürür
// 4. Token kullanımını takip eder (user_tokens tablosu)
// 5. Rate limiting ve error handling yapar
// 6. Token limit kontrolü yapar (aboneliğe göre)
// 7. RAG context ekleme desteği (Pinecone)
// 8. Confidence threshold kontrolü (%70)
// 9. Human approval zorunluluğu kontrolü
// 
// AI Görevleri ve Varsayılan Yapılandırma:
// | Görev                | Varsayılan Model | Açıklama                    |
// |---------------------|------------------|------------------------------|
// | notification_summary | MINIMAX         | Tebligat özetleme            |
// | deadline_extract     | CLAUDE          | Süre çıkarımı (kritik)       |
// | case_summary        | MINIMAX         | Dosya özeti                 |
// | decision_analysis   | CLAUDE          | Karar analizi (kritik)       |
// | document_generate   | MINIMAX         | Dilekçe üretimi              |
// | document_revise     | MINIMAX         | Dilekçe revizyonu            |
// | legal_notice        | MINIMAX         | İhtarname üretimi            |
// | legal_research      | CLAUDE          | İçtihat araştırma (kritik)   |
// | general_qa          | MINIMAX         | Genel soru-cevap             |
// ============================================================================

import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinimaxProvider } from './providers/minimax.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { AiModel, SubscriptionPackage } from '@prisma/client';

// AI görev tipleri
export type AiTaskType =
  | 'notification_summary'
  | 'deadline_extract'
  | 'case_summary'
  | 'decision_analysis'
  | 'document_generate'
  | 'document_revise'
  | 'legal_notice'
  | 'legal_research'
  | 'general_qa';

// AI isteği arayüzü
export interface AiRequest {
  taskType: AiTaskType;
  input: string;
  context?: Record<string, any>; // Ek bağlam bilgisi (dosya ID, kullanıcı bilgisi, vs.)
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

// AI yanıtı arayüzü
export interface AiResponse {
  success: boolean;
  result: string;
  model: AiModel;
  tokensUsed?: number;
  confidence?: number;
  requiresApproval?: boolean; // İnsan onayı gerekli mi
  metadata?: Record<string, any>;
}

// Confidence threshold - %70 altında "emin değilim" mesajı göster
const CONFIDENCE_THRESHOLD = 0.7;

// Paket bazlı token limitleri (aylık)
const PACKAGE_TOKEN_LIMITS: Record<string, number> = {
  FREE: 100,
  BASIC: 1000,
  STANDARD: 5000,
  PROFESSIONAL: 10000,
  ENTERPRISE: 50000,
};

// Kritik görevler - Claude gerektiren veya yüksek önemli
const CRITICAL_TASKS = ['deadline_extract', 'decision_analysis', 'legal_research'];

// RAG görevleri - Pinecone'dan context gerektiren
const RAG_TASKS = ['case_summary', 'legal_research', 'decision_analysis'];

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private minimaxProvider: MinimaxProvider,
    private claudeProvider: ClaudeProvider,
  ) {}

  /**
   * AI İsteğini İşle
   * 
   * Gelen isteği alır, hangi modelin kullanılacağını belirler
   * ve ilgili provider'ı çağırır
   * 
   * @param request - AI isteği
   * @param userId - İsteği yapan kullanıcı ID'si
   * @returns AI yanıtı
   */
  async processRequest(request: AiRequest, userId: string): Promise<AiResponse> {
    const { taskType, input, context, options } = request;

    // -----------------------------------------------------------------------------
    // TOKEN LİMİT KONTROLÜ
    // -----------------------------------------------------------------------------
    // Kullanıcının mevcut token kullanımını kontrol et
    // Limit aşımı varsa hata fırlat
    await this.checkTokenLimit(userId);

    // -----------------------------------------------------------------------------
    // CLAUDE İÇİN AÇIK RIZA KONTROLÜ
    // -----------------------------------------------------------------------------
    // Claude kullanılacaksa KVKK açık rızasını kontrol et
    const config = await this.prisma.aiConfig.findUnique({
      where: { taskName: taskType },
    });

    if (!config || !config.isActive) {
      throw new BadRequestException(`Geçersiz veya pasif AI görevi: ${taskType}`);
    }

    // Eğer model Claude ise ve görev kritik ise açık rıza kontrolü yap
    if (config.model === 'CLAUDE' && CRITICAL_TASKS.includes(taskType)) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.claudeConsent) {
        throw new ForbiddenException(
          'Claude kullanımı için açık rıza vermeniz gerekmektedir. ' +
          'Profil ayarlarından KVKK ve Claude rızasını onaylayabilirsiniz.'
        );
      }
    }

    // -----------------------------------------------------------------------------
    // RAG CONTEXT EKLEME
    // -----------------------------------------------------------------------------
    // Eğer görev RAG gerektiriyorsa Pinecone'dan relevant context çek
    let enrichedInput = input;
    if (RAG_TASKS.includes(taskType) && context?.caseId) {
      const ragContext = await this.getRagContext(context.caseId, input);
      if (ragContext) {
        enrichedInput = `=== İLGİLİ BELGELERDEN BILGILER ===\n${ragContext}\n\n=== SORU ===\n${input}`;
      }
    }

    // -----------------------------------------------------------------------------
    // PROVIDER SEÇİMİ
    // -----------------------------------------------------------------------------
    const model = config.model;
    const provider = model === 'MINIMAX' ? this.minimaxProvider : this.claudeProvider;

    // -----------------------------------------------------------------------------
    // AI İSTEĞİNİ ÇALIŞTIR
    // -----------------------------------------------------------------------------
    try {
      const result = await provider.process({
        taskType,
        input: enrichedInput,
        context,
        settings: config.settings as any,
        options,
      });

      // -----------------------------------------------------------------------------
      // TOKEN KULLANIMINI KAYDET
      // -----------------------------------------------------------------------------
      if (result.tokensUsed) {
        await this.recordTokenUsage(userId, model, taskType, result.tokensUsed);
      }

      // -----------------------------------------------------------------------------
      // CONFIDENCE THRESHOLD KONTROLÜ
      // -----------------------------------------------------------------------------
      // %70 altında güven skoru varsa "emin değilim" notu ekle
      if (result.confidence && result.confidence < CONFIDENCE_THRESHOLD) {
        result.text += '\n\n⚠️ Bu bilgiyi doğrulayamıyorum. Lütfen kaynağı kontrol ediniz.';
      }

      // -----------------------------------------------------------------------------
      // İNSAN ONAYI GEREKLİ Mİ?
      // -----------------------------------------------------------------------------
      // AI üretimi belgeler için insan onayı zorunlu
      const requiresApproval = ['document_generate', 'document_revise', 'legal_notice'].includes(taskType);

      // -----------------------------------------------------------------------------
      // DÖNÜŞ
      // -----------------------------------------------------------------------------
      return {
        success: true,
        result: result.text,
        model,
        tokensUsed: result.tokensUsed,
        confidence: result.confidence,
        requiresApproval,
        metadata: {
          taskType,
          processedAt: new Date().toISOString(),
          ragContextUsed: RAG_TASKS.includes(taskType),
          ...result.metadata,
        },
      };
    } catch (error) {
      console.error('AI İşlem hatası:', error);
      throw new BadRequestException(`AI işlemi başarısız: ${error.message}`);
    }
  }

  /**
   * Tebligat Özetleme
   * 
   * UETS'ten gelen tebligat metnini özetler
   * Kritik bilgileri (süre, karar, vs.) çıkarır
   * 
   * @param notificationText - Tebligat metni
   * @param userId - Kullanıcı ID'si
   */
  async summarizeNotification(notificationText: string, userId: string) {
    return this.processRequest(
      {
        taskType: 'notification_summary',
        input: notificationText,
        context: { source: 'uets_notification' },
      },
      userId,
    );
  }

  /**
   * Süre Çıkarımı
   * 
   * Tebligat metninden süre bilgisini çıkarır
   * "15 gün içinde itiraz" gibi bilgileri tespit eder
   * 
   * @param text - Tebligat veya karar metni
   * @param userId - Kullanıcı ID'si
   */
  async extractDeadline(text: string, userId: string) {
    return this.processRequest(
      {
        taskType: 'deadline_extract',
        input: text,
        context: { source: 'deadline_extraction' },
      },
      userId,
    );
  }

  /**
   * Dosya Özeti (RAG Destekli)
   * 
   * Bir davanın tüm belgelerini özetler
   * RAG ile Pinecone'dan ilgili context çekilir
   * Duruşma tarihleri, kararlar, taraflar hakkında özet çıkarır
   * 
   * @param caseId - Dosya ID'si
   * @param userId - Kullanıcı ID'si
   */
  async summarizeCase(caseId: string, userId: string) {
    // Dosyanın belgelerini al
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId, userId },
      include: {
        hearings: { orderBy: { hearingDate: 'desc' }, take: 10 },
        documents: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!caseData) {
      throw new BadRequestException('Dosya bulunamadı veya erişim yetkiniz yok');
    }

    // Dosya bilgilerini metin olarak birleştir
    const caseText = this.buildCaseContext(caseData);

    // RAG context ile birlikte gönder
    return this.processRequest(
      {
        taskType: 'case_summary',
        input: caseText,
        context: { caseId, source: 'case_summary' },
      },
      userId,
    );
  }

  /**
   * Karar Analizi (RAG Destekli)
   * 
   * Bir mahkeme kararının lehte veya aleyhte olduğunu analiz eder
   * RAG ile benzer kararlar araştırılır
   * Kritik görev - Claude kullanılır
   * 
   * @param decisionText - Karar metni
   * @param userId - Kullanıcı ID'si
   */
  async analyzeDecision(decisionText: string, userId: string) {
    return this.processRequest(
      {
        taskType: 'decision_analysis',
        input: decisionText,
        context: { source: 'court_decision' },
      },
      userId,
    );
  }

  /**
   * Dilekçe Üretimi
   * 
   * Verilen bilgilerle dilekçe taslağı üretir
   * İnsan onayı zorunlu
   * 
   * @param params - Dilekçe parametreleri
   * @param userId - Kullanıcı ID'si
   */
  async generateDocument(
    params: {
      type: 'petition' | 'legal_notice' | 'other';
      caseId?: string;
      details: Record<string, any>;
      style?: 'formal' | 'semi-formal';
    },
    userId: string,
  ) {
    // Token limit kontrolü (arge için)
    await this.checkTokenLimit(userId, 500); // Dilekçe ~500 token

    // Dilekçe metnini oluştur
    const documentInput = this.buildDocumentPrompt(params);

    return this.processRequest(
      {
        taskType: params.type === 'legal_notice' ? 'legal_notice' : 'document_generate',
        input: documentInput,
        context: { caseId: params.caseId, documentType: params.type },
      },
      userId,
    );
  }

  /**
   * Dilekçe Revizyonu
   * 
   * Mevcut bir dilekçeyi kullanıcının isteğine göre günceller
   * İnsan onayı zorunlu
   * 
   * @param documentId - Belge ID'si
   * @param revisionRequest - Revizyon isteği
   * @param userId - Kullanıcı ID'si
   */
  async reviseDocument(
    documentId: string,
    revisionRequest: string,
    userId: string,
  ) {
    // Belgeyi al
    const document = await this.prisma.document.findUnique({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new BadRequestException('Belge bulunamadı');
    }

    // Revizyon isteğiyle birlikte mevcut belgeyi gönder
    return this.processRequest(
      {
        taskType: 'document_revise',
        input: `Mevcut Belge:\n${document.content}\n\nRevizyon İsteği:\n${revisionRequest}`,
        context: { documentId, source: 'document_revise' },
      },
      userId,
    );
  }

  /**
   * İçtihat Araştırması (RAG Destekli)
   * 
   * Verilen konuda içtihat ve emsal karar araştırır
   * Pinecone'dan benzer kararlar çekilir
   * Kritik görev - Claude kullanılır
   * 
   * @param query - Arama sorgusu
   * @param userId - Kullanıcı ID'si
   */
  async legalResearch(query: string, userId: string) {
    // Token limit kontrolü (arge için yüksek)
    await this.checkTokenLimit(userId, 2000);

    return this.processRequest(
      {
        taskType: 'legal_research',
        input: query,
        context: { source: 'legal_research' },
      },
      userId,
    );
  }

  /**
   * Genel Soru-Cevap
   * 
   * Kullanıcının hukuki sorularını yanıtlar
   * Basit ve hızlı - Minimax kullanılır
   * 
   * @param question - Soru
   * @param userId - Kullanıcı ID'si
   */
  async chat(question: string, userId: string) {
    return this.processRequest(
      {
        taskType: 'general_qa',
        input: question,
        context: { source: 'general_chat' },
      },
      userId,
    );
  }

  /**
   * Belge Embedding Oluştur (RAG için)
   * 
   * Belgeyi chunk'lara ayırır, embedding üretir ve Pinecone'a kaydeder
   * 
   * @param documentId - Belge ID'si
   * @param userId - Kullanıcı ID'si
   */
  async createDocumentEmbedding(documentId: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new BadRequestException('Belge bulunamadı');
    }

    // TODO: Implement chunking and embedding
    // 1. Belge metnini chunk'lara ayır (512-1024 token)
    // 2. Her chunk için embedding üret (Minimax embed model)
    // 3. Pinecone'a kaydet (vector_id döndür)
    // 4. DocumentEmbedding tablosuna kaydet

    console.log(`[TODO] Belge embedding oluşturulacak: ${documentId}`);

    return { message: 'Embedding oluşturma başlatıldı', documentId };
  }

  /**
   * RAG Context Çek (Pinecone'dan)
   * 
   * Verilen caseId için Pinecone'dan ilgili belgeleri çeker
   * 
   * @param caseId - Dosya ID'si
   * @param query - Arama sorgusu
   * @returns Pinecone'dan dönen relevant context
   */
  async getRagContext(caseId: string, query: string): Promise<string | null> {
    // TODO: Pinecone entegrasyonu
    // 1. Query'yi embedding'e çevir
    // 2. Pinecone'da similarity search yap (top-k=5)
    // 3. En yakın belgelerin metnini döndür

    console.log(`[TODO] RAG context çekilecek - caseId: ${caseId}, query: ${query.substring(0, 50)}...`);
    return null; // Şimdilik null döndür
  }

  // ============================================================================
  // YARDIMCI METODLAR
  // ============================================================================

  /**
   * Token Limit Kontrolü
   * 
   * Kullanıcının mevcut token kullanımını kontrol eder
   * Abonelik limitini aşıyorsa hata fırlatır
   * 
   * @param userId - Kullanıcı ID'si
   * @param additionalTokens - Ek olarak tahmin edilen token sayısı
   */
  private async checkTokenLimit(userId: string, additionalTokens: number = 0) {
    // Kullanıcının aktif aboneliğini bul
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, isActive: true },
      orderBy: { endDate: 'desc' },
    });

    if (!subscription) {
      throw new ForbiddenException(
        'Aboneliğiniz bulunamadı. Lütfen profil sayfasından abonelik durumunuzu kontrol edin.'
      );
    }

    // Aylık token kullanımını hesapla
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const tokenUsage = await this.prisma.userToken.aggregate({
      where: {
        userId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
      _sum: { tokenAmount: true },
    });

    const usedTokens = tokenUsage._sum.tokenAmount || 0;
    const totalUsed = usedTokens + additionalTokens;

    // Limit kontrolü
    if (totalUsed > subscription.tokenLimit) {
      const remaining = subscription.tokenLimit - usedTokens;
      throw new ForbiddenException(
        `Token limitinizi aştınız. Bu işlem için ~${additionalTokens} token gerekiyor, ` +
        `ancak bu ay ${remaining} token hakkınız kaldı. ` +
        `Lütfen abonelik paketinizi yükseltin veya sonraki ayı bekleyin.`
      );
    }
  }

  /**
   * Token Kullanımını Kaydet
   */
  private async recordTokenUsage(
    userId: string,
    model: AiModel,
    taskType: string,
    tokensUsed: number,
  ) {
    // Bu ay için token kullanımını güncelle
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Token kaydı oluştur
    await this.prisma.userToken.create({
      data: {
        userId,
        tokenAmount: tokensUsed,
        aiModel: model,
        taskType,
        periodStart,
        periodEnd,
      },
    });

    // Subscription'ın tokensUsed alanını güncelle (gerçek zamanlı takip için)
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, isActive: true },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { tokensUsed: { increment: tokensUsed } },
      });
    }
  }

  /**
   * Dosya Bağlamını Oluştur
   */
  private buildCaseContext(caseData: any): string {
    const parts: string[] = [];

    // Temel bilgiler
    parts.push(`Dosya No: ${caseData.caseNumber}`);
    parts.push(`Mahkeme: ${caseData.court || 'Belirtilmemiş'}`);
    parts.push(`Konu: ${caseData.subject || 'Belirtilmemiş'}`);
    parts.push(`Durum: ${caseData.status}`);
    parts.push('');

    // Taraflar
    if (caseData.parties) {
      const parties = typeof caseData.parties === 'string'
        ? JSON.parse(caseData.parties)
        : caseData.parties;
      if (parties.plaintiff) parts.push(`Davacı: ${parties.plaintiff}`);
      if (parties.defendant) parts.push(`Davalı: ${parties.defendant}`);
      parts.push('');
    }

    // Duruşmalar
    if (caseData.hearings?.length > 0) {
      parts.push('DURUŞMALAR:');
      caseData.hearings.forEach((h: any) => {
        const date = new Date(h.hearingDate).toLocaleDateString('tr-TR');
        parts.push(`- ${date}: ${h.status}${h.result ? ` (${h.result})` : ''}`);
      });
      parts.push('');
    }

    // Son tebligatlar
    if (caseData.notifications?.length > 0) {
      parts.push('SON TEBLİGATLAR:');
      caseData.notifications.forEach((n: any) => {
        const date = new Date(n.createdAt).toLocaleDateString('tr-TR');
        parts.push(`- [${n.type}] ${date}: ${n.title}`);
      });
      parts.push('');
    }

    // Belge sayısı
    parts.push(`${caseData.documents?.length || 0} adet belge mevcut.`);

    return parts.join('\n');
  }

  /**
   * Belge İstem Metnini Oluştur
   */
  private buildDocumentPrompt(params: {
    type: string;
    caseId?: string;
    details: Record<string, any>;
    style?: string;
  }): string {
    const parts: string[] = [];

    parts.push(`Belge Türü: ${params.type.toUpperCase()}`);
    parts.push(`Üslup: ${params.style || 'resmi'}`);
    parts.push('');

    // Detayları ekle
    Object.entries(params.details).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        parts.push(`${key.toUpperCase()}:`);
        value.forEach((v: any) => parts.push(`- ${v}`));
        parts.push('');
      } else {
        parts.push(`${key}: ${value}`);
      }
    });

    return parts.join('\n');
  }

  /**
   * AI Yapılandırma Tablosunu Başlat
   * 
   * Sistem ilk çalıştığında AI görev yapılandırmasını oluşturur
   * Bu metod uygulama başlatıldığında çağrılır
   */
  async seedAiConfig() {
    const defaultConfigs = [
      { taskName: 'notification_summary', displayName: 'Tebligat Özetleme', model: 'MINIMAX' as AiModel, description: 'UETS tebligatlarını özetler', priority: 1 },
      { taskName: 'deadline_extract', displayName: 'Süre Çıkarımı', model: 'CLAUDE' as AiModel, description: 'Tebligatlardan yasal süreleri çıkarır (kritik)', priority: 2 },
      { taskName: 'case_summary', displayName: 'Dosya Özeti', model: 'MINIMAX' as AiModel, description: 'Dava dosyalarını özetler (RAG destekli)', priority: 3 },
      { taskName: 'decision_analysis', displayName: 'Karar Analizi', model: 'CLAUDE' as AiModel, description: 'Mahkeme kararlarının lehte/aleyhte analizi (kritik)', priority: 4 },
      { taskName: 'document_generate', displayName: 'Dilekçe Üretimi', model: 'MINIMAX' as AiModel, description: 'AI ile dilekçe taslağı üretir', priority: 5 },
      { taskName: 'document_revise', displayName: 'Dilekçe Revizyonu', model: 'MINIMAX' as AiModel, description: 'Mevcut dilekçeleri revize eder', priority: 6 },
      { taskName: 'legal_notice', displayName: 'İhtarname Üretimi', model: 'MINIMAX' as AiModel, description: 'Hukuki ihtarname üretir', priority: 7 },
      { taskName: 'legal_research', displayName: 'İçtihat Araştırması', model: 'CLAUDE' as AiModel, description: 'İçtihat ve emsal karar araştırır (kritik)', priority: 8 },
      { taskName: 'general_qa', displayName: 'Genel Soru-Cevap', model: 'MINIMAX' as AiModel, description: 'Hukuki konularda genel soruları yanıtlar', priority: 9 },
    ];

    for (const config of defaultConfigs) {
      await this.prisma.aiConfig.upsert({
        where: { taskName: config.taskName },
        update: {},
        create: config,
      });
    }

    console.log('[AI Service] AI yapılandırması başlatıldı');
  }
}