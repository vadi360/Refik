// ============================================================================
// İcra Modülü (icra.service.ts)
// Açıklama: Otomatik icra takibi servisi
// 
// Bu servis:
// 1. İcra takip numarası ile dosya takibi yapar
// 2. UYAP icra modülünden durum çeker
// 3. Otomatik hatırlatıcı oluşturur (haciz, satış, ödeme tarihleri)
// 4. AI ile icra durumu analizi yapar
// 5. Tahsilat takibi yapar
// 
// İcra Takip Süreci:
// 1. Avukat icra takip numarası girer
// 2. Sistem UYAP'tan icra dosyasını çeker
// 3. Dosya durumu takip edilir:
//    - Haciz işlemleri
//    - Satış tarihleri
//    - Ödeme planları
//    - Tebligatlar
// 4. Kritik tarihlerde otomatik hatırlatıcı oluşturulur
// 5. AI ile durum analizi yapılır
// 
// Kullanılan Teknolojiler:
// - UYAP Avukat Portal API (scraping veya resmi API)
// - AI analiz (borçlu durumu, mal varlığı)
// - RAG ile benzer dava araştırması
// ============================================================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RemindersService } from '../reminders/reminders.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService as NotifService } from '../notifications/notifications.service';

/**
 * İcra takip türleri
 */
export enum IcraTrackingType {
  ALACAK = 'alacak',          // Alacak davası icrası
  TAKIP = 'takip',           // Genel icra takibi
  İSTİHKAK = 'istihkak',     // İstihkak iddiası
  HACİZ = 'haciz',           // Haciz işlemleri
  SATIŞ = 'satış',           // Satış işlemleri
  TAHSİLAT = 'tahsilat',       // Tahsilat takibi
}

/**
 * İcra dosya durumları
 */
export enum IcraFileStatus {
  AKTIF = 'aktif',          // aktif takip
  KESİNLEŞEN = 'kesinlesen', // Kesinleşmiş
  SONA EREN = 'sona_eren',   // Sona eren
  HACİZ = 'haciz',          // Haciz aşamasında
  SATIŞ = 'satış',           // Satış aşamasında
  TAHSİLAT = 'tahsilat',     // Tahsilat aşamasında
}

/**
 * İcra dosyası bilgileri (UYAP'tan çekilecek)
 */
export interface IcraFileInfo {
  takipNumarasi: string;        // İcra takip numarası
  alacakli: string;              // Alacaklı (avukatın müvekkili)
  borclu: string;                // Borçlu
  borcluTC?: string;             // Borçlu TC
  borcluAdres?: string;          // Borçlu adresi
  takipTarihi: Date;             // Takip başlangıç tarihi
  takipTuru: IcraTrackingType;   // Takip türü
  dosyaDurumu: IcraFileStatus;   // Dosya durumu
  takipMiktari: number;          // Takip edilen miktar
  odemeMiktari?: number;         // Ödenen miktar
  kalanMiktar?: number;          // Kalan miktar
  sonTarih?: Date;              // Son işlem tarihi
  sonrakiAsama?: string;        // Sonraki aşama bilgisi
  satişTarihi?: Date;           // Satış tarihi (varsa)
  hacizBilgileri?: HacizInfo[]; // Haciz bilgileri
  tahsilatPlanlari?: TahsilatPlan[]; // Ödeme planları
}

/**
 * Haciz bilgileri
 */
export interface HacizInfo {
  tarih: Date;
  tur: string;          // Mevduat, menkul, gayrimenkul
  konum: string;        // Nerede haciz
  miktar?: number;      // Haciz miktarı
  durum: string;        // Devam ediyor, kaldırıldı, vs
}

/**
 * Tahsilat planı
 */
export interface TahsilatPlan {
  tarih: Date;
  miktar: number;
  durum: 'bekleyen' | 'odendi' | 'gecikme';
  aciklama?: string;
}

/**
 * İcra takip sonucu
 */
export interface IcraTrackingResult {
  success: boolean;
  fileId?: string;
  isNew: boolean;
  status: IcraFileStatus;
  summary?: string;
  nextAction?: string;
  errors?: string[];
}

@Injectable()
export class IcraService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private remindersService: RemindersService,
    private aiService: AiService,
  ) {}

  /**
   * İcra Takibi Başlat
   * 
   * Avukat icra takip numarasını girer
   * Sistem UYAP'tan dosya bilgilerini çeker ve takibe alır
   * 
   * @param userId - Avukat ID
   * @param takipNumarasi - İcra takip numarası
   * @param alacakli - Alacaklı bilgisi
   * @param borclu - Borçlu bilgisi
   */
  async startTracking(
    userId: string,
    takipNumarasi: string,
    alacakli: string,
    borclu: string,
  ): Promise<IcraTrackingResult> {
    // Aynı takip numarası zaten var mı kontrol et
    const existing = await this.prisma.icraFile.findFirst({
      where: {
        takipNumarasi,
        userId,
        deletedAt: null,
      },
    });

    if (existing) {
      // Mevcut takibi güncelle
      return {
        success: true,
        fileId: existing.id,
        isNew: false,
        status: existing.durum as IcraFileStatus,
      };
    }

    try {
      // UYAP'tan icra dosyasını çek (placeholder - gerçek API yok)
      const fileInfo = await this.fetchFromUYAP(takipNumarasi, alacakli, borclu);

      // Yeni icra dosyası oluştur
      const icraFile = await this.prisma.icraFile.create({
        data: {
          userId,
          takipNumarasi,
          alacakli,
          borclu,
          borcluTC: fileInfo.borcluTC,
          borcluAdres: fileInfo.borcluAdres,
          takipTarihi: fileInfo.takipTarihi,
          takipTuru: fileInfo.takipTuru as any,
          durum: fileInfo.dosyaDurumu as any,
          takipMiktari: fileInfo.takipMiktari,
          odemeMiktari: fileInfo.odemeMiktari || 0,
          kalanMiktar: fileInfo.kalanMiktar || fileInfo.takipMiktari,
          satişTarihi: fileInfo.satişTarihi,
          sonrakiAsama: fileInfo.sonrakiAsama,
          // AI analiz sonucu
          aiAnaliz: null,
          // Takip devam ediyor
          aktif: true,
        },
      });

      // Kritik tarihler için hatırlatıcı oluştur
      await this.createReminders(icraFile, fileInfo);

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'ICRA_TRACKING_STARTED',
          entityType: 'icra_files',
          entityId: icraFile.id,
          newValue: { takipNumarasi, alacakli, borclu } as any,
        },
      });

      return {
        success: true,
        fileId: icraFile.id,
        isNew: true,
        status: fileInfo.dosyaDurumu,
        summary: `İcra takibi başlatıldı: ${takipNumarasi}`,
        nextAction: this.getNextAction(fileInfo),
      };
    } catch (error) {
      return {
        success: false,
        status: 'AKTIF' as IcraFileStatus,
        errors: [error.message],
      };
    }
  }

  /**
   * İcra Dosyasını Güncelle
   * 
   * UYAP'tan son durumu çeker ve günceller
   */
  async refreshTracking(userId: string, fileId: string): Promise<IcraTrackingResult> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: fileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    try {
      // UYAP'tan güncel bilgileri çek
      const fileInfo = await this.fetchFromUYAP(file.takipNumarasi, file.alacakli, file.borclu);

      // Dosyayı güncelle
      const updated = await this.prisma.icraFile.update({
        where: { id: fileId },
        data: {
          durum: fileInfo.dosyaDurumu as any,
          odemeMiktari: fileInfo.odemeMiktari || file.odemeMiktari,
          kalanMiktar: fileInfo.kalanMiktar || file.kalanMiktar,
          satışTarihi: fileInfo.satişTarihi,
          sonrakiAsama: fileInfo.sonrakiAsama,
          lastRefreshAt: new Date(),
        },
      });

      // Değişiklik varsa bildirim gönder
      if (file.durum !== fileInfo.dosyaDurumu) {
        await this.notifyStatusChange(userId, file, fileInfo.dosyaDurumu);
      }

      return {
        success: true,
        fileId: updated.id,
        isNew: false,
        status: fileInfo.dosyaDurumu,
        summary: `İcra dosyası güncellendi: ${file.takipNumarasi}`,
        nextAction: this.getNextAction(fileInfo),
      };
    } catch (error) {
      return {
        success: false,
        fileId,
        status: file.durum as IcraFileStatus,
        errors: [error.message],
      };
    }
  }

  /**
   * Tüm İcra Dosyalarını Getir
   */
  async getAllFiles(userId: string, filters?: {
    durum?: IcraFileStatus;
    aktif?: boolean;
  }): Promise<any[]> {
    const where: any = { userId, deletedAt: null };
    
    if (filters?.durum) where.durum = filters.durum;
    if (filters?.aktif !== undefined) where.aktif = filters.aktif;

    return this.prisma.icraFile.findMany({
      where,
      include: {
        reminders: true,
        documents: true,
      },
      orderBy: { lastRefreshAt: 'desc' },
    });
  }

  /**
   * Tek İcra Dosyası Getir
   */
  async getFile(userId: string, fileId: string): Promise<any> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: fileId, userId, deletedAt: null },
      include: {
        reminders: true,
        documents: true,
        tahsilatlar: true,
      },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    return file;
  }

  /**
   * Tahsilat Ekle
   */
  async addPayment(
    userId: string,
    fileId: string,
    amount: number,
    date: Date,
    description?: string,
  ): Promise<any> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: fileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    // Tahsilat kaydı oluştur
    const payment = await this.prisma.icraPayment.create({
      data: {
        icraFileId: fileId,
        amount,
        paymentDate: date,
        description,
        status: 'COMPLETED' as any,
      },
    });

    // Dosya bakiyesini güncelle
    const newKalan = file.kalanMiktar - amount;
    await this.prisma.icraFile.update({
      where: { id: fileId },
      data: {
        odemeMiktari: file.odemeMiktari + amount,
        kalanMiktar: newKalan > 0 ? newKalan : 0,
        durum: newKalan <= 0 ? 'SONA EREN' as any : file.durum as any,
        aktif: newKalan > 0,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ICRA_PAYMENT_ADDED',
        entityType: 'icra_payments',
        entityId: payment.id,
        newValue: { fileId, amount, date } as any,
      },
    });

    return payment;
  }

  /**
   * İcra Dosyasını Kapat
   */
  async closeFile(userId: string, fileId: string, reason: string): Promise<void> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: fileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    await this.prisma.icraFile.update({
      where: { id: fileId },
      data: {
        aktif: false,
        durum: 'SONA EREN' as any,
        kapatmaNedeni: reason,
        closedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ICRA_FILE_CLOSED',
        entityType: 'icra_files',
        entityId: fileId,
        newValue: { reason } as any,
      },
    });
  }

  /**
   * AI ile İcra Durumu Analizi
   */
  async analyzeStatus(userId: string, fileId: string): Promise<{
    analysis: string;
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: fileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('İcra dosyası bulunamadı');
    }

    // AI analiz için prompt hazırla
    const context = `
      İcra Takip Numarası: ${file.takipNumarasi}
      Alacaklı: ${file.alacakli}
      Borçlu: ${file.borclu}
      Takip Tarihi: ${file.takipTarihi}
      Takip Miktari: ${file.takipMiktari} TL
      Ödenen: ${file.odemeMiktari} TL
      Kalan: ${file.kalanMiktar} TL
      Dosya Durumu: ${file.durum}
      Sonraki Aşama: ${file.sonrakiAsama}
      Satış Tarihi: ${file.satişTarihi}
    `;

    try {
      const result = await this.aiService.analyzeCase(context, userId);

      // AI analiz sonucunu kaydet
      await this.prisma.icraFile.update({
        where: { id: fileId },
        data: { aiAnaliz: result },
      });

      // Risk seviyesi belirle
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (file.kalanMiktar > file.takipMiktari * 0.5) riskLevel = 'high';
      else if (file.kalanMiktar > file.takipMiktari * 0.2) riskLevel = 'medium';

      return {
        analysis: result.summary || 'Analiz tamamlandı',
        recommendation: result.recommendation || 'Mevcut durumu takip etmeye devam edin',
        riskLevel,
      };
    } catch (error) {
      return {
        analysis: 'AI analizi yapılamadı',
        recommendation: 'Manuel kontrol önerilir',
        riskLevel: 'medium',
      };
    }
  }

  /**
   * UYAP'tan İcra Dosyasını Çek
   * 
   * NOT: UYAP'ın resmi icra API'si yok. Bu metod placeholder'dır.
   * Gerçek implementasyon için:
   * 1. UYAP Avukat Portal scraping
   * 2. UYAP XML dosya formatı parse
   * 3. UYAP API açılırsa kullanma
   */
  private async fetchFromUYAP(
    takipNumarasi: string,
    alacakli: string,
    borclu: string,
  ): Promise<IcraFileInfo> {
    // TODO: Gerçek UYAP entegrasyonu
    // Şimdilik placeholder data döndür
    
    console.log(`[ICRA] UYAP'tan dosya çekiliyor: ${takipNumarasi}`);

    return {
      takipNumarasi,
      alacakli,
      borclu,
      takipTarihi: new Date(),
      takipTuru: IcraTrackingType.TAKIP,
      dosyaDurumu: IcraFileStatus.AKTIF,
      takipMiktari: 0,
      sonrakiAsama: 'Ödeme emri bekleniyor',
    };
  }

  /**
   * Hatırlatıcı Oluştur
   */
  private async createReminders(icraFile: any, fileInfo: IcraFileInfo): Promise<void> {
    const reminders: any[] = [];

    // Satış tarihi varsa hatırlatıcı oluştur
    if (fileInfo.satişTarihi) {
      reminders.push({
        userId: icraFile.userId,
        icraFileId: icraFile.id,
        type: 'ICRA' as any,
        title: `Satış Tarihi: ${fileInfo.takipNumarasi}`,
        dueDate: fileInfo.satişTarihi,
        remindAt: new Date(fileInfo.satişTarihi.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 gün önce
        notifyTypes: ['push', 'email'] as any,
        status: 'ACTIVE' as any,
      });
    }

    // Her tahsilat planı için hatırlatıcı
    if (fileInfo.tahsilatPlanlari) {
      for (const plan of fileInfo.tahsilatPlanlari) {
        if (plan.durum === 'bekleyen') {
          reminders.push({
            userId: icraFile.userId,
            icraFileId: icraFile.id,
            type: 'ICRA' as any,
            title: `Ödeme: ${plan.miktar} TL - ${fileInfo.takipNumarasi}`,
            dueDate: plan.tarih,
            remindAt: new Date(plan.tarih.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 gün önce
            notifyTypes: ['push', 'sms'] as any,
            status: 'ACTIVE' as any,
          });
        }
      }
    }

    // Hatırlatıcıları oluştur
    for (const reminder of reminders) {
      await this.prisma.reminder.create({ data: reminder });
    }
  }

  /**
   * Durum Değişikliği Bildirimi
   */
  private async notifyStatusChange(
    userId: string,
    oldFile: any,
    newStatus: IcraFileStatus,
  ): Promise<void> {
    const statusMessages: Record<IcraFileStatus, string> = {
      'KESİNLEŞEN': 'İcra dosyanız kesinleşti',
      'SONA EREN': 'İcra dosyanız sona erdi',
      'HACİZ': 'Yeni haciz işlemi başlatıldı',
      'SATIŞ': 'Satış süreci başladı',
      'TAHSİLAT': 'Tahsilat aşamasına geçildi',
      'AKTIF': 'Dosya güncellendi',
    };

    await this.notificationsService.sendToUser(userId, {
      title: '📋 İcra Durumu Değişikliği',
      body: statusMessages[newStatus] || `Dosya durumu: ${newStatus}`,
      type: 'ICRA' as any,
    });
  }

  /**
   * Sonraki aksiyonu belirle
   */
  private getNextAction(fileInfo: IcraFileInfo): string {
    if (fileInfo.sonrakiAsama) return fileInfo.sonrakiAsama;
    
    switch (fileInfo.dosyaDurumu) {
      case 'AKTIF':
        return 'Ödeme emri bekleniyor';
      case 'KESİNLEŞEN':
        return 'Haciz işlemi başlatılabilir';
      case 'HACİZ':
        return 'Mal varlığı araştırması yapın';
      case 'SATIŞ':
        return 'Satış tarihini takip edin';
      default:
        return 'Dosyayı takip etmeye devam edin';
    }
  }
}