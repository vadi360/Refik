// ============================================================================
// RAG (Retrieval Augmented Generation) Servisi (rag.service.ts)
// Açıklama: Pinecone vektör veritabanı ile RAG tabanlı arama
// 
// Bu servis:
// 1. Metin embedding'leri oluşturur (Minimax embed model)
// 2. Embedding'leri Pinecone'a kaydeder
// 3. Similarity search yapar
// 4. Belgeleri chunk'lara ayırır
// 5. AI yanıtları için context hazırlar
// 
// RAG (Retrieval Augmented Generation):
// - Kullanıcı sorusu → embedding'e çevir
// - Pinecone'da en yakın belgeleri bul (similarity search)
// - Bulunan belgeleri context olarak AI'a gönder
// - AI daha doğru ve context-aware yanıt verir
// ============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// Pinecone client import (yüklenecek: @pinecone-database/pinecone)
import { Pinecone } from '@pinecone-database/pinecone';

export interface RagSearchResult {
  id: string;
  score: number; // Benzerlik skoru (0-1 arası)
  text: string;
  documentId: string;
  caseId: string;
  metadata?: Record<string, any>;
}

export interface RagSearchOptions {
  topK?: number; // Kaç sonuç getirilecek (varsayılan: 5)
  filter?: Record<string, any>; // Metadata filtreleri
  includeMetadata?: boolean;
}

export interface ChunkOptions {
  chunkSize?: number; // Her chunk'ın token sayısı (varsayılan: 512)
  overlap?: number; // Chunk'lar arası örtüşme (varsayılan: 50)
}

@Injectable()
export class RagService {
  // Pinecone client
  private pinecone: Pinecone;
  private indexName: string;
  
  // Embedding model
  private embeddingModel = 'minimax-embedding'; // Minimax embedding model
  private embeddingDimensions = 1536; // Minimax embedding boyutu
  
  // Logger
  private readonly logger = new Logger(RagService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Pinecone client başlat
    const pineconeApiKey = this.configService.get<string>('PINECONE_API_KEY', '');
    
    if (pineconeApiKey) {
      this.pinecone = new Pinecone({ pineconeApiKey });
      this.indexName = this.configService.get<string>('PINECONE_INDEX_NAME', 'avukatpro-documents');
      this.logger.log('Pinecone başarıyla yapılandırıldı');
    } else {
      this.logger.warn('Pinecone API key yapılandırılmamış. RAG servisleri devre dışı.');
    }
  }

  /**
   * Metni embedding'e çevir (Minimax API kullanarak)
   * 
   * @param text - Embedding'e çevrilecek metin
   * @returns Embedding vector
   */
  async createEmbedding(text: string): Promise<number[]> {
    // TODO: Minimax Embedding API implementasyonu
    // API: POST https://api.minimax.chat/v1/text/embeddings
    // Request: { "model": "embo-01", "input": text }
    // Response: { "data": [{ "embedding": [...] }] }

    this.logger.warn('Minimax embedding API henüz implement edilmedi');

    // Placeholder - gerçek implementasyon için Minimax API kullanılacak
    return Array(this.embeddingDimensions).fill(0).map(() => Math.random() * 2 - 1);
  }

  /**
   * Belgeyi Pinecone'a kaydet
   * 
   * 1. Belgeyi chunk'lara ayır
   * 2. Her chunk için embedding oluştur
   * 3. Pinecone'a kaydet
   * 4. DocumentEmbedding tablosuna kaydet (lokal DB)
   * 
   * @param documentId - Belge ID
   * @param caseId - Dava ID
   * @param options - Chunk seçenekleri
   */
  async indexDocument(documentId: string, caseId: string, options: ChunkOptions = {}): Promise<void> {
    if (!this.pinecone) {
      throw new Error('Pinecone yapılandırılmamış');
    }

    const { chunkSize = 512, overlap = 50 } = options;

    // Belgeyi al
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.content) {
      throw new Error('Belge bulunamadı veya içerik yok');
    }

    // Metni chunk'lara ayır
    const chunks = this.splitIntoChunks(document.content, chunkSize, overlap);

    this.logger.log(`${document.title} - ${chunks.length} chunk oluşturuldu`);

    // Her chunk için embedding ve Pinecone kaydı
    const index = this.pinecone.Index(this.indexName);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Embedding oluştur
      const embedding = await this.createEmbedding(chunk);

      // Pinecone vector ID
      const vectorId = `${documentId}-chunk-${i}`;

      // Metadata
      const metadata = {
        documentId,
        caseId,
        chunkIndex: i,
        text: chunk.substring(0, 500), // İlk 500 karakter (arama için)
        title: document.title,
        type: document.type,
        createdAt: document.createdAt.toISOString(),
      };

      // Pinecone'a kaydet
      await index.upsert([{
        id: vectorId,
        values: embedding,
        metadata,
      }]);

      // DocumentEmbedding tablosuna kaydet (lokal DB)
      await this.prisma.documentEmbedding.create({
        data: {
          documentId,
          caseId,
          vectorId,
          chunkIndex: i,
          chunkText: chunk,
          model: this.embeddingModel,
          dimensions: this.embeddingDimensions,
          tokenCount: Math.ceil(chunk.length / 4), // Yaklaşık token sayısı
        },
      });

      // Rate limiting
      await this.delay(100);
    }

    // Belgeyi işaretle
    await this.prisma.document.update({
      where: { id: documentId },
      data: { embedded: true, embeddingModel: this.embeddingModel },
    });

    // Dosyayı da işaretle
    await this.prisma.case.update({
      where: { id: caseId },
      data: { ragIndexed: true, lastRagSyncAt: new Date() },
    });

    this.logger.log(`${document.title} - Pinecone'a kaydedildi (${chunks.length} chunk)`);
  }

  /**
   * Similarity search yap
   * 
   * @param query - Arama sorgusu
   * @param caseId - Dava ID (filtreleme için)
   * @param options - Arama seçenekleri
   * @returns Benzer belgeler
   */
  async search(query: string, caseId?: string, options: RagSearchOptions = {}): Promise<RagSearchResult[]> {
    if (!this.pinecone) {
      throw new Error('Pinecone yapılandırılmamış');
    }

    const { topK = 5, filter, includeMetadata = true } = options;

    // Query embedding oluştur
    const queryEmbedding = await this.createEmbedding(query);

    // Pinecone'da ara
    const index = this.pinecone.Index(this.indexName);

    const searchParams: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata,
      includeValues: false,
    };

    // Filtre ekle (caseId varsa)
    if (caseId) {
      searchParams.filter = { caseId };
    } else if (filter) {
      searchParams.filter = filter;
    }

    const searchResponse = await index.query(searchParams);

    // Sonuçları dönüştür
    const results: RagSearchResult[] = (searchResponse.matches || []).map(match => ({
      id: match.id,
      score: match.score,
      text: (match.metadata as any)?.text || '',
      documentId: (match.metadata as any)?.documentId || '',
      caseId: (match.metadata as any)?.caseId || '',
      metadata: match.metadata as Record<string, any>,
    }));

    this.logger.log(`RAG arama: "${query.substring(0, 50)}..." - ${results.length} sonuç bulundu`);

    return results;
  }

  /**
   * AI için context hazırla
   * 
   * Sorgu için en alakalı belgeleri çeker ve
   * AI'a gönderilecek context string'ini oluşturur
   * 
   * @param query - Kullanıcı sorusu
   * @param caseId - Dava ID (opsiyonel)
   * @param maxChars - Maximum karakter sayısı (varsayılan: 4000)
   * @returns AI için context string'i
   */
  async prepareContext(query: string, caseId?: string, maxChars: number = 4000): Promise<string> {
    // Benzer belgeleri bul
    const results = await this.search(query, caseId, { topK: 5 });

    if (results.length === 0) {
      return '';
    }

    // Belgeleri birleştir
    let context = '';
    for (const result of results) {
      const chunk = result.text;
      if (context.length + chunk.length > maxChars) {
        break;
      }
      context += `---\n[${result.score.toFixed(2)}] ${chunk}\n---\n`;
    }

    return context.trim();
  }

  /**
   * Belgeyi Pinecone'dan sil
   * 
   * @param documentId - Belge ID
   */
  async deleteDocumentEmbeddings(documentId: string): Promise<void> {
    if (!this.pinecone) return;

    // Pinecone'dan sil
    const index = this.pinecone.Index(this.indexName);
    const vectorsToDelete: string[] = [];

    // DocumentEmbedding tablosundan ilgili kayıtları bul
    const embeddings = await this.prisma.documentEmbedding.findMany({
      where: { documentId },
      select: { vectorId: true },
    });

    for (const embedding of embeddings) {
      vectorsToDelete.push(embedding.vectorId);
    }

    // Pinecone'dan sil
    if (vectorsToDelete.length > 0) {
      await index.deleteMany(vectorsToDelete);
    }

    // DocumentEmbedding tablosundan sil
    await this.prisma.documentEmbedding.deleteMany({
      where: { documentId },
    });

    // Belgeyi güncelle
    await this.prisma.document.update({
      where: { id: documentId },
      data: { embedded: false },
    });

    this.logger.log(`${documentId} - Pinecone'dan silindi (${vectorsToDelete.length} vector)`);
  }

  /**
   * Metni chunk'lara ayır
   * 
   * Token bazlı chunking yapar (yaklaşık 4 karakter = 1 token)
   * 
   * @param text - Bölünecek metin
   * @param chunkSize - Her chunk'ın token sayısı
   * @param overlap - Chunk'lar arası örtüşme token sayısı
   */
  private splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const charsPerToken = 4; // Yaklaşık
    const chunkCharSize = chunkSize * charsPerToken;
    const overlapCharSize = overlap * charsPerToken;

    let start = 0;

    while (start < text.length) {
      let end = start + chunkCharSize;

      // Son kelime veya cümlede bitir (word boundary)
      if (end < text.length) {
        // En yakın kelime sınırını bul
        const lastSpace = text.lastIndexOf(' ', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const boundary = Math.max(lastSpace, lastNewline);

        if (boundary > start + chunkCharSize / 2) {
          end = boundary;
        }
      }

      chunks.push(text.substring(start, end).trim());
      start = end - overlapCharSize;
    }

    return chunks;
  }

  /**
   * Gecikme yardımcı metodu
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Pinecone index istatistiklerini getir
   */
  async getIndexStats(): Promise<{ totalVectors: number; dimension: number }> {
    if (!this.pinecone) {
      return { totalVectors: 0, dimension: 0 };
    }

    try {
      const index = this.pinecone.Index(this.indexName);
      const stats = await index.describeIndexStats();
      
      return {
        totalVectors: stats.totalRecordCount || 0,
        dimension: stats.dimension || 0,
      };
    } catch (error) {
      this.logger.error('Pinecone index istatistikleri alınamadı:', error);
      return { totalVectors: 0, dimension: 0 };
    }
  }
}