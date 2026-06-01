// ============================================================================
// Files Servisi (files.service.ts)
// Açıklama: CloudFlare R2 dosya işlemleri servisi
// ============================================================================
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private r2AccountId: string;
  private r2AccessKey: string;
  private r2SecretKey: string;
  private r2Bucket: string;
  private r2PublicUrl: string;

  constructor(private configService: ConfigService) {
    this.r2AccountId = this.configService.get<string>('R2_ACCOUNT_ID', '');
    this.r2AccessKey = this.configService.get<string>('R2_ACCESS_KEY', '');
    this.r2SecretKey = this.configService.get<string>('R2_SECRET_KEY', '');
    this.r2Bucket = this.configService.get<string>('R2_BUCKET', 'refik-documents');
    this.r2PublicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');
  }

  /**
   * Ön Imzalı URL Oluştur (Upload için)
   */
  async getUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
    if (!this.r2AccountId) throw new BadRequestException('R2 yapılandırılmamış');

    // Dosya anahtarı oluştur (unique)
    const timestamp = Date.now();
    const fileKey = `${timestamp}-${fileName}`;

    // TODO: Gerçek R2 ön-imzalı URL oluşturma
    // Şimdilik dummy URL döndür
    const uploadUrl = `https://upload.r2.dev/${this.r2Bucket}/${fileKey}`;

    return { uploadUrl, fileKey };
  }

  /**
   * Dosya URL'i Döndür
   */
  getFileUrl(fileKey: string): string {
    if (!this.r2PublicUrl) return `https://pub.r2.dev/${this.r2Bucket}/${fileKey}`;
    return `${this.r2PublicUrl}/${fileKey}`;
  }

  /**
   * Dosya Sil
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    // TODO: R2'dan dosya silme
    console.log(`[TODO] R2'dan silinecek dosya: ${fileKey}`);
    return true;
  }
}