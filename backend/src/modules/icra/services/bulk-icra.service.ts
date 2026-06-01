// ============================================================================
// Toplu İcra Takip Servisi (bulk-icra.service.ts)
// Açıklama: Toplu icra takip işlemleri
// 
// Bu servis:
// 1. XML dosyasından toplu icra takibi başlatma
// 2. Excel/CSV ile toplu takip numarası ekleme
// 3. Toplu durum güncelleme
// 
// Kullanım:
// 1. Avukat UYAP'tan XML dosyasını indirir
// 2. XML'i sisteme yükler
// 3. Sistem tüm takipleri otomatik olarak kaydeder
// ============================================================================
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IcraService } from './icra.service';
import * as xml2js from 'xml2js';

export interface BulkTrackingResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
  results: { row: number; takipNumarasi: string; status: string; fileId?: string }[];
}

@Injectable()
export class BulkIcraService {
  constructor(
    private prisma: PrismaService,
    private icraService: IcraService,
  ) {}

  /**
   * XML Dosyasından Toplu Takip Başlat
   * 
   * UYAP'tan indirilen XML dosyasını parse eder
   * Her takip için icra takibi oluşturur
   * 
   * @param userId - Kullanıcı ID
   * @param xmlContent - XML dosya içeriği
   */
  async processXmlFile(userId: string, xmlContent: string): Promise<BulkTrackingResult> {
    const result: BulkTrackingResult = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    try {
      // XML'i parse et
      const parsed = await xml2js.parseStringPromise(xmlContent, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      // UYAP XML yapısına göre takipleri bul
      const takipler = this.extractTakipsFromXml(parsed);
      result.total = takipler.length;

      // Her takip için işlem yap
      for (let i = 0; i < takipler.length; i++) {
        const takip = takipler[i];
        
        try {
          const trackingResult = await this.icraService.startTracking(
            userId,
            takip.takipNumarasi,
            takip.alacakli,
            takip.borclu,
          );

          result.results.push({
            row: i + 1,
            takipNumarasi: takip.takipNumarasi,
            status: trackingResult.success ? 'success' : 'failed',
            fileId: trackingResult.fileId,
          });

          if (trackingResult.success) {
            result.success++;
          } else {
            result.failed++;
            result.errors.push({
              row: i + 1,
              message: trackingResult.errors?.join(', ') || 'Bilinmeyen hata',
            });
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            message: error.message,
          });
        }
      }
    } catch (error) {
      throw new BadRequestException(`XML parse hatası: ${error.message}`);
    }

    return result;
  }

  /**
   * CSV/Excel ile Toplu Takip Ekle
   * 
   * CSV formatında takip numaralarını işler
   * Format: takipNumarasi,alacakli,borclu
   * 
   * @param userId - Kullanıcı ID
   * @param csvContent - CSV içeriği
   */
  async processCsvFile(userId: string, csvContent: string): Promise<BulkTrackingResult> {
    const result: BulkTrackingResult = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    try {
      // CSV'yi parse et
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Header kontrolü
      const takipIdx = headers.indexOf('takipnumarasi') || headers.indexOf('takip_no');
      const alacakliIdx = headers.indexOf('alacakli');
      const borcluIdx = headers.indexOf('borclu');

      if (takipIdx === -1) {
        throw new BadRequestException('CSV dosyasında "takipNumarasi" sütunu bulunamadı');
      }

      result.total = lines.length - 1; // Header hariç

      // Her satır için işlem yap
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        try {
          const takipNumarasi = values[takipIdx];
          const alacakli = alacakliIdx >= 0 ? values[alacakliIdx] : 'Müvekkil';
          const borclu = borcluIdx >= 0 ? values[borcluIdx] : 'Borçlu';

          if (!takipNumarasi) {
            result.failed++;
            result.errors.push({ row: i + 1, message: 'Takip numarası boş' });
            continue;
          }

          const trackingResult = await this.icraService.startTracking(
            userId,
            takipNumarasi,
            alacakli,
            borclu,
          );

          result.results.push({
            row: i + 1,
            takipNumarasi,
            status: trackingResult.success ? 'success' : 'failed',
            fileId: trackingResult.fileId,
          });

          if (trackingResult.success) {
            result.success++;
          } else {
            result.failed++;
            result.errors.push({
              row: i + 1,
              message: trackingResult.errors?.join(', ') || 'Bilinmeyen hata',
            });
          }
        } catch (error) {
          result.failed++;
          result.errors.push({ row: i + 1, message: error.message });
        }
      }
    } catch (error) {
      throw new BadRequestException(`CSV parse hatası: ${error.message}`);
    }

    return result;
  }

  /**
   * Toplu Dosya Güncelleme
   * 
   * Tüm aktif takipler için UYAP'tan güncelleme yapar
   */
  async refreshAllFiles(userId: string): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    const files = await this.prisma.icraFile.findMany({
      where: { userId, aktif: true, deletedAt: null },
    });

    let success = 0;
    let failed = 0;

    for (const file of files) {
      try {
        await this.icraService.refreshTracking(userId, file.id);
        success++;
      } catch {
        failed++;
      }
    }

    return { total: files.length, success, failed };
  }

  /**
   * UYAP XML'inden takipleri çıkar
   */
  private extractTakipsFromXml(parsed: any): { takipNumarasi: string; alacakli: string; borclu: string }[] {
    const takipler: { takipNumarasi: string; alacakli: string; borclu: string }[] = [];

    try {
      // UYAP XML yapısı (farklı versiyonlar olabilir)
      //尝试不同的XML路径
      const root = parsed.uyap || parsed.UYAP || parsed.takipler || parsed.Takipler || parsed;

      if (root) {
        let takipArray = root.takip || root.takip || root.dosya || root.Dosya || [];

        // Tekil nesne ise diziye çevir
        if (!Array.isArray(takipArray)) {
          takipArray = [takipArray];
        }

        for (const takip of takipArray) {
          takipler.push({
            takipNumarasi: takip.takipNo || takip.takip_numarasi || takip.takipNumarasi || '',
            alacakli: takip.alacakli || takip.Alacakli || '',
            borclu: takip.borclu || takip.Borclu || '',
          });
        }
      }
    } catch (error) {
      console.error('[BulkIcra] XML çıkarma hatası:', error);
    }

    return takipler;
  }
}