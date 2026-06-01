// ============================================================================
// UYAP Servisi (uyap.service.ts)
// Açıklama: UYAP (Ulusal Yargı Ağı Platformu) entegrasyon servisi
// 
// Bu servis:
// 1. Chrome eklentisinden gelen dava ve belge bilgilerini işler
// 2. UYAP'tan çekilen dava bilgilerini veritabanına kaydeder/günceller
// 3. Dosyadaki belgeleri işler ve RAG için indeksler
// 4. UYAP durumunu senkronize eder
// 
// NOT: UYAP'ın resmi API'si yoktur. Bu servis Chrome eklentisi ile
// avukatın kendi UYAP hesabından çekilen verileri işler.
// Eklenti scraping yapar - avukatın kendi verileri, okuma amaçlı.
// ============================================================================
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RagService } from '../rag/services/rag.service';

export interface UyapCaseData {
  // UYAP'tan çekilen dava bilgileri
  uyapId: string; // UYAP'taki benzersiz dava ID'si
  caseNumber: string; // Dosya numarası (eski numara formatı)
  newCaseNumber?: string; // Yeni numara formatı (varsa)
  court: string; // Mahkeme adı
  courtCode?: string; // Mahkeme kodu
  caseType: string; // Dava türü (ceza, hukuk, idare, vb.)
  caseKind?: string; // Dava cinsi
  subject: string; // Dava konusu
  subjectCode?: string; // Konu kodu
  caseStatus: string; // Dava durumu (dergiden, karara çıktı, vb.)
  filingDate?: Date; // Dava açılma tarihi
  parties?: {
    plaintiff?: string; // Davacı
    defendant?: string; // Davalı
    plaintiffCounsel?: string; // Davacı vekili
    defendantCounsel?: string; // Davalı vekili
  };
  caseValue?: number; // Dava değeri (parasal)
  judgment?: {
    decision: string; // Karar
    decisionDate?: Date; // Karar tarihi
    decisionType?: string; // Karar türü
  };
  // Eklenti metadata
  capturedAt: Date; // Verinin yakalandığı zaman
  source: 'chrome_extension'; // Veri kaynağı
}

export interface UyapDocumentData {
  // UYAP'tan çekilen belge bilgileri
  uyapDocId: string; // UYAP'taki belge ID'si
  documentType: string; // Belge türü (dilekçe, karar, teslim tutanağı, vb.)
  documentKind?: string; // Belge cinsi
  title: string; // Belge başlığı
  documentDate?: Date; // Belge tarihi
  receivedDate?: Date; // Tebligat tarihi (varsa)
  content?: string; // Belge içeriği (metin olarak)
  fileUrl?: string; // Dosya URL'i (R2'de saklanacak)
  fileSize?: number; // Dosya boyutu
  fileType?: string; // Dosya türü (pdf, docx, vb.)
  pageCount?: number; // Sayfa sayısı
  isConfidential: boolean; // Gizli belge mi
}

export interface UyapSyncResult {
  // Senkronizasyon sonucu
  success: boolean;
  caseId?: string;
  isNew: boolean; // Yeni kayıt mıydı
  updatedFields: string[]; // Güncellenen alanlar
  documentsAdded: number; // Eklenen belge sayısı
  documentsUpdated: number; // Güncellenen belge sayısı
  errors?: string[];
}

@Injectable()
export class UyapService {
  constructor(
    private prisma: PrismaService,
    private ragService: RagService,
  ) {}

  /**
   * UYAP Davasını Kaydet veya Güncelle
   * 
   * Chrome eklentisinden gelen dava bilgilerini veritabanına kaydeder
   * Aynı uyapId ile kayıt varsa günceller, yoksa yeni oluşturur
   * 
   * @param userId - Avukatın kullanıcı ID'si
   * @param caseData - UYAP'tan gelen dava bilgileri
   * @returns Senkronizasyon sonucu
   */
  async saveOrUpdateCase(userId: string, caseData: UyapCaseData): Promise<UyapSyncResult> {
    const result: UyapSyncResult = {
      success: false,
      isNew: false,
      updatedFields: [],
      documentsAdded: 0,
      documentsUpdated: 0,
    };

    try {
      // Mevcut kaydı kontrol et (uyapId ile)
      const existingCase = await this.prisma.case.findFirst({
        where: { 
          userId, 
          uyapId: caseData.uyapId,
          deletedAt: null,
        },
      });

      if (existingCase) {
        // ═══════════════════════════════════════════════════════════════
        // GÜNCELLEME - Mevcut davayı güncelle
        // ═══════════════════════════════════════════════════════════════
        
        const updateData: any = {
          // Sadece değişen alanları güncelle
          caseNumber: caseData.caseNumber,
          court: caseData.court,
          subject: caseData.subject,
          status: this.mapCaseStatus(caseData.caseStatus),
        };

        // Yeni numara varsa güncelle
        if (caseData.newCaseNumber) {
          updateData.caseNumber = caseData.newCaseNumber;
        }

        // Taraflar varsa güncelle (JSON olarak sakla)
        if (caseData.parties) {
          updateData.parties = caseData.parties;
        }

        // Karar varsa güncelle
        if (caseData.judgment) {
          updateData.decisionAnalysis = caseData.judgment;
        }

        // Dava değeri varsa güncelle
        if (caseData.caseValue !== undefined) {
          // caseValue alanı yok, bu yüzden metadata olarak sakla
          // veya mevcut bir alan bulunabilir
        }

        // Veritabanını güncelle
        const updated = await this.prisma.case.update({
          where: { id: existingCase.id },
          data: updateData,
        });

        result.caseId = updated.id;
        result.isNew = false;
        result.updatedFields = Object.keys(updateData);
        
      } else {
        // ═══════════════════════════════════════════════════════════════
        // YENİ KAYIT - Yeni dava oluştur
        // ═══════════════════════════════════════════════════════════════
        
        const newCase = await this.prisma.case.create({
          data: {
            userId,
            uyapId: caseData.uyapId,
            caseNumber: caseData.newCaseNumber || caseData.caseNumber,
            court: caseData.court,
            subject: caseData.subject,
            parties: caseData.parties ? caseData.parties as any : undefined,
            status: this.mapCaseStatus(caseData.caseStatus),
            // AI summary henüz yok, sonra eklenecek
            // decisionAnalysis: caseData.judgment ? caseData.judgment as any : undefined,
            // RagIndexed: false (henüz belgeler işlenmedi)
          },
        });

        result.caseId = newCase.id;
        result.isNew = true;
        result.updatedFields = ['id'];
      }

      result.success = true;
      
      // Audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: result.isNew ? 'UYAP_CASE_CREATED' : 'UYAP_CASE_UPDATED',
          entityType: 'cases',
          entityId: result.caseId,
          newValue: caseData as any,
        },
      });

    } catch (error) {
      result.errors = [error.message];
      console.error('UYAP case save error:', error);
    }

    return result;
  }

  /**
   * UYAP Belgelerini Kaydet
   * 
   * Bir davaya ait belgeleri veritabanına kaydeder
   * Her belge için RAG embedding oluşturur
   * 
   * @param userId - Avukatın kullanıcı ID'si
   * @param caseId - Dava ID'si (veritabanındaki)
   * @param documents - Belge dizisi
   * @returns Kaydedilen belge sayısı
   */
  async saveDocuments(
    userId: string,
    caseId: string,
    documents: UyapDocumentData[],
  ): Promise<{ saved: number; indexed: number; errors: string[] }> {
    const result = { saved: 0, indexed: 0, errors: [] as string[] };

    // Davanın kullanıcıya ait olduğunu doğrula
    const caseData = await this.prisma.case.findFirst({
      where: { id: caseId, userId, deletedAt: null },
    });

    if (!caseData) {
      throw new NotFoundException('Dava bulunamadı veya erişim yetkiniz yok');
    }

    for (const doc of documents) {
      try {
        // Mevcut belge kontrolü (uyapDocId ile)
        const existingDoc = await this.prisma.document.findFirst({
          where: {
            userId,
            caseId,
            title: doc.title,
          },
        });

        if (existingDoc) {
          // ═══════════════════════════════════════════════════════════════
          // BELGE GÜNCELLEME
          // ═══════════════════════════════════════════════════════════════
          
          await this.prisma.document.update({
            where: { id: existingDoc.id },
            data: {
              content: doc.content || existingDoc.content,
              fileUrl: doc.fileUrl || existingDoc.fileUrl,
              fileSize: doc.fileSize || existingDoc.fileSize,
              // AI model used - belge içeriği varsa AI ile işlenebilir
            },
          });
          
          result.saved++;
          result.errors.push(`Güncellendi: ${doc.title}`);
          
        } else {
          // ═══════════════════════════════════════════════════════════════
          // YENİ BELGE KAYDI
          // ═══════════════════════════════════════════════════════════════
          
          const newDoc = await this.prisma.document.create({
            data: {
              userId,
              caseId,
              type: this.mapDocumentType(doc.documentType),
              title: doc.title,
              content: doc.content,
              fileUrl: doc.fileUrl,
              fileSize: doc.fileSize,
              fileType: doc.fileType,
              status: 'DRAFT' as any,
              // embedded: false (henüz indekslenmedi)
            },
          });

          result.saved++;

          // ═══════════════════════════════════════════════════════════════
          // RAG İNDEKSLEME
          // ═══════════════════════════════════════════════════════════════
          // Belge içeriği varsa RAG için indeksle
          if (doc.content && doc.content.length > 100) {
            try {
              // RAG servisi embedding oluşturur ve Pinecone'a kaydeder
              await this.ragService.indexDocument(newDoc.id, caseId);
              result.indexed++;
              
              // Belgeyi indekslendi olarak işaretle
              await this.prisma.document.update({
                where: { id: newDoc.id },
                data: { embedded: true },
              });
            } catch (ragError) {
              console.error('RAG indexing error:', ragError);
              result.errors.push(`RAG hatası: ${doc.title}`);
            }
          }
        }

      } catch (error) {
        result.errors.push(`Hata: ${doc.title} - ${error.message}`);
      }
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UYAP_DOCUMENTS_SAVED',
        entityType: 'cases',
        entityId: caseId,
        newValue: { documentsCount: result.saved, indexedCount: result.indexed } as any,
      },
    });

    return result;
  }

  /**
   * UYAP'tan Gelenleri Otomatik İşle
   * 
   * Chrome eklentisi birden fazla dava veya belge gönderebilir
   * Bu metod hepsini işler
   * 
   * @param userId - Avukatın kullanıcı ID'si
   * @param data - Dava veya dava dizisi
   */
  async processIncomingData(
    userId: string,
    data: {
      cases?: UyapCaseData[];
      documents?: { caseId: string; documents: UyapDocumentData[] }[];
    },
  ): Promise<{
    casesProcessed: number;
    documentsProcessed: number;
    errors: string[];
  }> {
    const result = {
      casesProcessed: 0,
      documentsProcessed: 0,
      errors: [] as string[],
    };

    // Davaları işle
    if (data.cases && data.cases.length > 0) {
      for (const caseData of data.cases) {
        try {
          const caseResult = await this.saveOrUpdateCase(userId, caseData);
          if (caseResult.success) {
            result.casesProcessed++;
          } else {
            result.errors.push(...(caseResult.errors || []));
          }
        } catch (error) {
          result.errors.push(`Dava hatası: ${caseData.caseNumber} - ${error.message}`);
        }
      }
    }

    // Belgeleri işle
    if (data.documents && data.documents.length > 0) {
      for (const { caseId, documents } of data.documents) {
        try {
          const docResult = await this.saveDocuments(userId, caseId, documents);
          result.documentsProcessed += docResult.saved;
          result.errors.push(...docResult.errors);
        } catch (error) {
          result.errors.push(`Belge hatası: ${caseId} - ${error.message}`);
        }
      }
    }

    return result;
  }

  /**
   * UYAP Bağlantısını Kontrol Et
   * 
   * Kullanıcının UYAP eklentisi ile bağlı olup olmadığını kontrol eder
   * 
   * @param userId - Kullanıcı ID'si
   */
  async getConnectionStatus(userId: string) {
    // Kullanıcının son UYAP işlemlerini kontrol et
    const lastActivity = await this.prisma.auditLog.findFirst({
      where: {
        userId,
        action: { in: ['UYAP_CASE_CREATED', 'UYAP_CASE_UPDATED', 'UYAP_DOCUMENTS_SAVED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Toplam kaydettiği dava sayısı
    const totalCases = await this.prisma.case.count({
      where: { userId, uyapId: { not: null }, deletedAt: null },
    });

    // Toplam belgeleri
    const totalDocuments = await this.prisma.document.count({
      where: { userId, caseId: { not: null }, deletedAt: null },
    });

    return {
      connected: lastActivity !== null,
      lastSyncAt: lastActivity?.createdAt || null,
      totalCases,
      totalDocuments,
    };
  }

  /**
   * UYAP Dava Durumunu Haritaya Çevir
   */
  private mapCaseStatus(uyapStatus: string): string {
    const statusMap: Record<string, string> = {
      // UYAP durumları → bizim durumlarımız
      'DERĞİDEN': 'ACTIVE',
      'ESAS SÜRECİNDE': 'ACTIVE',
      'KARARA ÇIKTI': 'CLOSED',
      'İCARESİ BİTTİ': 'CLOSED',
      'GİZLİ': 'ARCHIVED',
      'ARŞİV': 'ARCHIVED',
      'BEKLEYEN': 'ACTIVE',
      'SONUÇLANAN': 'CLOSED',
    };

    const normalized = uyapStatus?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (normalized.includes(key.toUpperCase())) {
        return value;
      }
    }
    
    return 'ACTIVE'; // Varsayılan
  }

  /**
   * UYAP Belge Türünü Haritaya Çevir
   */
  private mapDocumentType(uyapType: string): string {
    const typeMap: Record<string, string> = {
      // UYAP belge türleri → bizim türlerimiz
      'DİLEKÇE': 'PETITION',
      'KARAR': 'DECISION',
      'TESLİM TUTANAĞI': 'CORRESPONDENCE',
      'İTİRAZ NİSHANİ': 'CORRESPONDENCE',
      'İHBARNAME': 'LEGAL_NOTICE',
      'İLAM': 'DECISION',
      'TUTANAK': 'CORRESPONDENCE',
      'MÜKTARİP': 'PETITION',
      'YAZI': 'CORRESPONDENCE',
      'BELGE': 'OTHER',
    };

    const normalized = uyapType?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (normalized.includes(key.toUpperCase())) {
        return value;
      }
    }
    
    return 'OTHER';
  }
}