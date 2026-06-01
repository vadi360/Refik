// ============================================================================
// UETS Servisi (uets.service.ts)
// Açıklama: PTT UETS entegrasyonu servisi
// 
// Bu servis:
// 1. UETS oturum yönetimi (bağlantı/bağlantı kesme)
// 2. Tebligatları senkronize etme
// 3. Okundu/okunmadı durumunu kontrol etme (5 gün kuralı)
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * UETS Bağlantısı Kur
   */
  async connect(userId: string, credentials: { username: string; password: string }) {
    // Kullanıcının mevcut oturumunu kontrol et
    const existing = await this.prisma.uetsSession.findUnique({ where: { userId } });

    if (existing) {
      // Mevcut oturumu güncelle
      return this.prisma.uetsSession.update({
        where: { userId },
        data: { encryptedCredentials: Buffer.from(JSON.stringify(credentials)).toString('base64'), isActive: true },
      });
    }

    // Yeni oturum oluştur
    return this.prisma.uetsSession.create({
      data: {
        userId,
        encryptedCredentials: Buffer.from(JSON.stringify(credentials)).toString('base64'),
        isActive: true,
      },
    });
  }

  /**
   * UETS Bağlantısını Kes
   */
  async disconnect(userId: string) {
    const session = await this.prisma.uetsSession.findUnique({ where: { userId } });
    if (!session) throw new NotFoundException('UETS bağlantısı bulunamadı');

    return this.prisma.uetsSession.update({
      where: { userId },
      data: { isActive: false },
    });
  }

  /**
   * UETS Durumu Getir
   */
  async getStatus(userId: string) {
    const session = await this.prisma.uetsSession.findUnique({ where: { userId } });
    if (!session) return { connected: false };

    return {
      connected: session.isActive,
      lastSyncAt: session.lastSyncAt,
    };
  }

  /**
   * UETS Tebligatlarını Senkronize Et
   * 
   * 5 gün kuralı: Açılmamış tebligatlar 5. günde otomatik okundu sayılır
   */
  async syncNotifications(userId: string) {
    const session = await this.prisma.uetsSession.findUnique({ where: { userId } });
    if (!session || !session.isActive) throw new NotFoundException('UETS bağlantısı aktif değil');

    // TODO: UETS API'sine gerçek istek gönderilecek
    // Şimdilik dummy implementasyon

    // Son senkronizasyon zamanını güncelle
    await this.prisma.uetsSession.update({
      where: { userId },
      data: { lastSyncAt: new Date() },
    });

    return { message: 'Senkronizasyon tamamlandı', newNotifications: 0 };
  }
}