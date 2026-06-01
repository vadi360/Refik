// ============================================================================
// Mal Varlığı Tespit Servisi (asset-detection.service.ts)
// Açıklama: AI ile borçlunun mal varlığını tespit eder
// 
// Bu servis:
// 1. UYAP, Gelir İdaresi, Tapu Kadastro gibi kaynaklardan veri çeker
// 2. AI ile mal varlığı analizi yapar
// 3. Değişiklikleri tespit eder ve bildirim gönderir
// 4. Haciz işlemi için öneriler sunar
// 
// Kullanılan Kaynaklar:
// - UYAP (icra dosyası bilgileri)
// - Gelir İdaresi Başkanlığı (vergi kayıtları)
// - Tapu ve Kadastro Genel Müdürlüğü
// - Merkez Bankası (IBAN sorgulama)
// ============================================================================
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

export interface AssetInfo {
  type: 'bank' | 'property' | 'vehicle' | 'company' | 'income' | 'other';
  description: string;
  value?: number;
  location?: string;
  details?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AssetDetectionResult {
  success: boolean;
  debtorName: string;
  assets: AssetInfo[];
  totalValue: number;
  recommendations: string[];
  lastChecked: Date;
}

@Injectable()
export class AssetDetectionService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * Borçlunun Tüm Mal Varlığını Tespit Et
   * 
   * Bir borçlu hakkında farklı kaynaklardan mal varlığı bilgisi toplar
   * AI ile analiz eder ve haciz için öneriler sunar
   * 
   * @param userId - Avukat ID
   * @param icraFileId - İcra dosyası ID
   */
  async detectAllAssets(userId: string, icraFileId: string): Promise<AssetDetectionResult> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: icraFileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new Error('İcra dosyası bulunamadı');
    }

    const assets: AssetInfo[] = [];

    // 1. Banka hesapları (varsa)
    const bankAssets = await this.detectBankAccounts(file);
    assets.push(...bankAssets);

    // 2. Taşınmazlar (varsa)
    const propertyAssets = await this.detectProperties(file);
    assets.push(...propertyAssets);

    // 3. Araçlar (varsa)
    const vehicleAssets = await this.detectVehicles(file);
    assets.push(...vehicleAssets);

    // 4. Şirket payları (varsa)
    const companyAssets = await this.detectCompanyShares(file);
    assets.push(...companyAssets);

    // 5. Gelir kaynakları (varsa)
    const incomeAssets = await this.detectIncomeSources(file);
    assets.push(...incomeAssets);

    // Toplam değeri hesapla
    const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);

    // AI ile analiz ve öneriler
    const analysis = await this.analyzeAssetsWithAI(assets, file);

    // Sonuçları kaydet
    await this.saveAssetHistory(icraFileId, assets);

    return {
      success: true,
      debtorName: file.borclu,
      assets,
      totalValue,
      recommendations: analysis.recommendations,
      lastChecked: new Date(),
    };
  }

  /**
   * Banka Hesabı Tespiti
   */
  private async detectBankAccounts(file: any): Promise<AssetInfo[]> {
    // TODO: Banka API'si veya UYAP scraping
    // Şimdilik boş döndür - gerçek entegrasyon için API gerekli
    return [];
  }

  /**
   * Taşınmaz Tespiti
   */
  private async detectProperties(file: any): Promise<AssetInfo[]> {
    // TODO: Tapu Kadastro API'si
    // Şimdilik boş döndür
    return [];
  }

  /**
   * Araç Tespiti
   */
  private async detectVehicles(file: any): Promise<AssetInfo[]> {
    // TODO: EGM API'si
    return [];
  }

  /**
   * Şirket Payı Tespiti
   */
  private async detectCompanyShares(file: any): Promise<AssetInfo[]> {
    // TODO: Ticaret Sicil API'si
    return [];
  }

  /**
   * Gelir Kaynağı Tespiti
   */
  private async detectIncomeSources(file: any): Promise<AssetInfo[]> {
    // TODO: SGK, Gelir İdaresi API'si
    return [];
  }

  /**
   * AI ile Mal Varlığı Analizi
   */
  private async analyzeAssetsWithAI(
    assets: AssetInfo[],
    file: any,
  ): Promise<{ recommendations: string[] }> {
    const context = `
      İcra Dosyası: ${file.takipNumarasi}
      Borçlu: ${file.borclu}
      Takip Miktari: ${file.takipMiktari} TL
      Kalan Miktar: ${file.kalanMiktar} TL
      
      Tespit Edilen Mal Varlıkları:
      ${assets.map((a, i) => `${i + 1}. ${a.type}: ${a.description} - Değer: ${a.value || 'bilinmiyor'} TL`).join('\n')}
    `;

    try {
      const result = await this.aiService.analyzeCase(context, file.userId);
      
      return {
        recommendations: result.recommendation 
          ? [result.recommendation]
          : ['Mevcut varlıklar için haciz işlemi başlatılabilir'],
      };
    } catch {
      return {
        recommendations: ['Varlık tespiti için ilgili kurumlara sorgulama yapın'],
      };
    }
  }

  /**
   * Mal Varlığı Geçmişini Kaydet
   */
  private async saveAssetHistory(icraFileId: string, assets: AssetInfo[]): Promise<void> {
    await this.prisma.icraAssetHistory.create({
      data: {
        icraFileId,
        assets: assets as any,
        totalValue: assets.reduce((sum, a) => sum + (a.value || 0), 0),
      },
    });
  }

  /**
   * Mal Varlığı Değişiklik Takibi
   * 
   * Son taramadaki varlıklarla güncel varlıkları karşılaştırır
   * Yeni varlık veya azalan varlık varsa bildirim gönderir
   */
  async trackChanges(userId: string, icraFileId: string): Promise<{
    newAssets: AssetInfo[];
    removedAssets: AssetInfo[];
    changedAssets: AssetInfo[];
  }> {
    const file = await this.prisma.icraFile.findFirst({
      where: { id: icraFileId, userId, deletedAt: null },
    });

    if (!file) {
      throw new Error('İcra dosyası bulunamadı');
    }

    // Güncel taramayı yap
    const currentResult = await this.detectAllAssets(userId, icraFileId);

    // Son tarama geçmişini al
    const lastHistory = await this.prisma.icraAssetHistory.findFirst({
      where: { icraFileId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastHistory) {
      return {
        newAssets: currentResult.assets,
        removedAssets: [],
        changedAssets: [],
      };
    }

    const previousAssets = (lastHistory.assets as any) as AssetInfo[];
    const currentAssets = currentResult.assets;

    // Karşılaştırma
    const previousTypes = previousAssets.map(a => `${a.type}-${a.description}`);
    const currentTypes = currentAssets.map(a => `${a.type}-${a.description}`);

    const newAssets = currentAssets.filter(
      a => !previousTypes.includes(`${a.type}-${a.description}`)
    );

    const removedAssets = previousAssets.filter(
      a => !currentTypes.includes(`${a.type}-${a.description}`)
    );

    const changedAssets = currentAssets.filter(a => {
      const prev = previousAssets.find(
        p => p.type === a.type && p.description === a.description
      );
      return prev && prev.value !== a.value;
    });

    return { newAssets, removedAssets, changedAssets };
  }
}