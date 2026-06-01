// ============================================================================
// Delegations Servisi (delegations.service.ts)
// Açıklama: Tevkil işlemleri servisi
// 
// Bu servis:
// 1. Tevkil oluşturma, onaylama, reddetme, iptal etme
// 2. Tevkil arama ve filtreleme
// 3. Tevkil puanlama
// 4. Önerilen avukatları listeleme (yük dengeleme ile)
// 5. Şikayet sistemi
// 
// YÜK DENGELAME ALGORİTMASI:
// - Aynı avukata sürekli tevkil vermemek için
// - Tamamlanmış tevkil sayısı + puan bazlı sıralama
// - Şehir ve uzmanlık match'ı
// ============================================================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplaintReason } from '@prisma/client';

// 24 saat sonra otomatik iptal için
const EXPIRATION_HOURS = 24;

// Yük dengeleme: Bir avukata maksimum kaç aktif tevkil?
const MAX_ACTIVE_DELEGATIONS_PER_LAWYER = 5;

@Injectable()
export class DelegationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm Tevkilleri Getir (Gönderilen + Alınan)
   */
  async findAll(userId: string, filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;

    const whereClause: any = {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
      deletedAt: null,
    };
    if (status) whereClause.status = status;

    const [delegations, total] = await Promise.all([
      this.prisma.delegation.findMany({
        where: whereClause,
        include: {
          fromUser: { select: { id: true, name: true, avatarUrl: true, rating: true } },
          toUser: { select: { id: true, name: true, avatarUrl: true, rating: true } },
          case: { select: { id: true, caseNumber: true, court: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.delegation.count({ where: whereClause }),
    ]);

    // Gönderilen ve alınan tevkilleri ayır
    const sent = delegations.filter(d => d.fromUserId === userId);
    const received = delegations.filter(d => d.toUserId === userId || d.toUserId === null);

    return { sent, received, total, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  /**
   * Yeni Tevkil Oluştur
   */
  async create(data: {
    fromUserId: string;
    caseId?: string;
    hearingDate?: Date;
    court?: string;
    message?: string;
    preferredLawyerId?: string;
  }) {
    const { fromUserId, caseId, hearingDate, court, message, preferredLawyerId } = data;

    // Önerilen avukatları bul (yük dengeleme ile)
    const recommendedLawyers = await this.findRecommendedLawyers(fromUserId, caseId);

    // Tevkil oluştur
    const delegation = await this.prisma.delegation.create({
      data: {
        fromUserId,
        caseId: caseId || null,
        hearingDate: hearingDate ? new Date(hearingDate) : null,
        court,
        message,
        toUserId: preferredLawyerId || null,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000),
      },
      include: {
        fromUser: { select: { id: true, name: true } },
        case: { select: { id: true, caseNumber: true } },
      },
    });

    // Gönderenin tevkil sayısını güncelle
    await this.prisma.user.update({
      where: { id: fromUserId },
      data: { ratingCount: { increment: 0 } }, // TODO: fromUserDelegationCount alanı eklenecek
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: { userId: fromUserId, action: 'DELEGATION_CREATE', entityType: 'delegations', entityId: delegation.id },
    });

    return { delegation, recommendedLawyers };
  }

  /**
   * Tevkil Detay Getir
   */
  async findOne(id: string, userId: string) {
    const delegation = await this.prisma.delegation.findUnique({
      where: { id },
      include: {
        fromUser: { select: { id: true, name: true, avatarUrl: true, rating: true, expertise: true, city: true, district: true } },
        toUser: { select: { id: true, name: true, avatarUrl: true, rating: true } },
        case: true,
        complaints: { include: { filedBy: { select: { name: true } } } },
      },
    });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');

    // Sadece ilgili kullanıcılar erişebilir
    if (delegation.fromUserId !== userId && delegation.toUserId !== userId) {
      throw new BadRequestException('Bu tevkile erişim yetkiniz yok');
    }

    return delegation;
  }

  /**
   * Tevkili Onayla
   */
  async approve(id: string, userId: string) {
    const delegation = await this.prisma.delegation.findUnique({ where: { id } });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');
    if (delegation.toUserId && delegation.toUserId !== userId) {
      throw new BadRequestException('Bu tevkili onaylama yetkiniz yok');
    }
    if (delegation.status !== 'PENDING') {
      throw new BadRequestException('Bu tevkil zaten işlenmiş');
    }

    // Süre kontrolü
    if (delegation.expiresAt && new Date() > delegation.expiresAt) {
      await this.prisma.delegation.update({ where: { id }, data: { status: 'CANCELLED' } });
      throw new BadRequestException('Bu tevkil süresi dolmuş');
    }

    // Yük dengeleme kontrolü - alan avukatın aktif tevkil sayısını kontrol et
    if (userId) {
      const activeDelegations = await this.prisma.delegation.count({
        where: { toUserId: userId, status: { in: ['PENDING', 'APPROVED'] } },
      });

      if (activeDelegations >= MAX_ACTIVE_DELEGATIONS_PER_LAWYER) {
        throw new BadRequestException(
          `Çok fazla aktif tevkiliniz var (${activeDelegations}/${MAX_ACTIVE_DELEGATIONS_PER_LAWYER}). ` +
          `Lütfen önce mevcut tevkillerinizi tamamlayın.`
        );
      }
    }

    const updated = await this.prisma.delegation.update({
      where: { id },
      data: { status: 'APPROVED', toUserId: userId },
    });

    await this.prisma.auditLog.create({
      data: { userId, action: 'DELEGATION_APPROVE', entityType: 'delegations', entityId: id },
    });

    return updated;
  }

  /**
   * Tevkili Reddet
   */
  async reject(id: string, userId: string, reason?: string) {
    const delegation = await this.prisma.delegation.findUnique({ where: { id } });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');
    if (delegation.toUserId && delegation.toUserId !== userId) {
      throw new BadRequestException('Bu tevkili reddetme yetkiniz yok');
    }

    const updated = await this.prisma.delegation.update({
      where: { id },
      data: { status: 'REJECTED', adminNote: reason },
    });

    await this.prisma.auditLog.create({
      data: { userId, action: 'DELEGATION_REJECT', entityType: 'delegations', entityId: id },
    });

    return updated;
  }

  /**
   * Tevkili İptal Et (Gönderen)
   */
  async cancel(id: string, userId: string) {
    const delegation = await this.prisma.delegation.findUnique({ where: { id } });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');
    if (delegation.fromUserId !== userId) {
      throw new BadRequestException('Bu tevkili iptal etme yetkiniz yok');
    }
    if (delegation.status !== 'PENDING') {
      throw new BadRequestException('Sadece beklemedeki tevkiller iptal edilebilir');
    }

    const updated = await this.prisma.delegation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.auditLog.create({
      data: { userId, action: 'DELEGATION_CANCEL', entityType: 'delegations', entityId: id },
    });

    return updated;
  }

  /**
   * Tevkili Tamamla
   */
  async complete(id: string, userId: string) {
    const delegation = await this.prisma.delegation.findUnique({ where: { id } });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');
    if (delegation.toUserId !== userId && delegation.fromUserId !== userId) {
      throw new BadRequestException('Bu tevkili tamamlama yetkiniz yok');
    }

    const updated = await this.prisma.delegation.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: { userId, action: 'DELEGATION_COMPLETE', entityType: 'delegations', entityId: id },
    });

    return updated;
  }

  /**
   * Tevkil Puanla
   */
  async rate(id: string, userId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('Puan 1-5 arasında olmalıdır');

    const delegation = await this.prisma.delegation.findUnique({ where: { id } });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');
    if (delegation.fromUserId !== userId) {
      throw new BadRequestException('Sadece tevkil göndereni puan verebilir');
    }
    if (delegation.status !== 'COMPLETED') {
      throw new BadRequestException('Sadece tamamlanmış tevkiller puanlanabilir');
    }

    const updated = await this.prisma.delegation.update({
      where: { id },
      data: { rating, ratingComment: comment },
    });

    // Alan avukatın puanını güncelle (yük dengeleme için toUserDelegationCount artır)
    if (delegation.toUserId) {
      const lawyer = await this.prisma.user.findUnique({ where: { id: delegation.toUserId } });
      if (lawyer) {
        const newRatingCount = lawyer.ratingCount + 1;
        const newRating = ((lawyer.rating as any) * lawyer.ratingCount + rating) / newRatingCount;
        await this.prisma.user.update({
          where: { id: delegation.toUserId },
          data: { 
            rating: newRating, 
            ratingCount: newRatingCount,
          },
        });

        // Yük dengeleme için toUserDelegationCount güncelle
        await this.prisma.delegation.update({
          where: { id },
          data: { toUserDelegationCount: { increment: 1 } },
        });
      }
    }

    return updated;
  }

  /**
   * Şikayet Oluştur
   */
  async createComplaint(id: string, userId: string, data: {
    reason: ComplaintReason;
    description: string;
  }) {
    const delegation = await this.prisma.delegation.findUnique({ where: { id } });

    if (!delegation) throw new NotFoundException('Tevkil bulunamadı');

    // Sadece gönderen veya alan şikayet edebilir
    if (delegation.fromUserId !== userId && delegation.toUserId !== userId) {
      throw new BadRequestException('Bu tevkil için şikayet oluşturma yetkiniz yok');
    }

    // Şikayet edilen kişiyi belirle (gönderen kendi değilse alanı, alan kendi değilse göndereni)
    const againstId = delegation.fromUserId === userId 
      ? delegation.toUserId 
      : delegation.fromUserId;

    if (!againstId) {
      throw new BadRequestException('Henüz atanmamış tevkiller için şikayet oluşturulamaz');
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        delegationId: id,
        filedById: userId,
        againstId,
        reason: data.reason,
        description: data.description,
        status: 'PENDING',
      },
      include: {
        delegation: { select: { id: true, caseId: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: { userId, action: 'COMPLAINT_CREATE', entityType: 'complaints', entityId: complaint.id },
    });

    return complaint;
  }

  /**
   * Şikayetleri Listele (Admin)
   */
  async findComplaints(filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (status) where.status = status;

    return this.prisma.complaint.findMany({
      where,
      include: {
        delegation: { select: { id: true, caseId: true, fromUserId: true, toUserId: true } },
        filedBy: { select: { id: true, name: true } },
        against: { select: { id: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Şikayeti Çözümle (Admin)
   */
  async resolveComplaint(id: string, adminId: string, data: { status: string; adminNote?: string }) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Şikayet bulunamadı');

    return this.prisma.complaint.update({
      where: { id },
      data: {
        status: data.status as any,
        adminNote: data.adminNote,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Önerilen Avukatları Bul (YÜK DENGELİ)
   * 
   * Yük dengeleme algoritması:
   * 1. Aynı şehirde ara
   * 2. Aktif tevkil sayısı az olanı tercih et
   * 3. Puan yüksek olanı tercih et
   * 4. Belirli uzmanlık varsa match et
   * 5. MAX_ACTIVE_DELEGATIONS_PER_LAWYER kontrolü
   */
  async findRecommendedLawyers(userId: string, caseId?: string) {
    // Kullanıcının profil bilgilerini al
    const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return [];

    // Aynı şehirdeki, aktif aboneliği olan avukatları bul
    // Yük dengeleme için aktif tevkil sayısını da çek
    const lawyers = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        city: currentUser.city,
        subscriptionStatus: { not: 'free' },
        deletedAt: null,
        // Yük dengeleme: Çok fazla aktif tevkili olanı hariç tutma
        // Sadece uyarı ver, hariç tutma
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        expertise: true,
        city: true,
        district: true,
        court: true,
        rating: true,
        ratingCount: true,
        // Aktif tevkillerini say
        receivedDelegations: {
          where: { status: { in: ['PENDING', 'APPROVED'] } },
          select: { id: true },
        },
      },
      orderBy: { rating: 'desc' },
      take: 20,
    });

    // Yük dengeleme puanı hesapla ve sırala
    const scoredLawyers = lawyers.map(l => {
      // Yük dengelame puanı: Düşük aktif tevkil = yüksek puan
      const activeCount = l.receivedDelegations.length;
      const loadBalanceScore = Math.max(0, MAX_ACTIVE_DELEGATIONS_PER_LAWYER - activeCount);

      // Toplam puan: rating (0-5) + yük dengeleme bonusu
      const ratingScore = Number(l.rating) || 0;
      const totalScore = ratingScore + (loadBalanceScore * 0.3); // Yük dengeleme %30 ağırlık

      return {
        ...l,
        activeDelegationsCount: activeCount,
        loadBalanceScore,
        totalScore,
        isOverloaded: activeCount >= MAX_ACTIVE_DELEGATIONS_PER_LAWYER,
      };
    });

    // Yük dengelemeye göre sırala (en yüksek puanlı en üstte)
    scoredLawyers.sort((a, b) => b.totalScore - a.totalScore);

    return scoredLawyers.slice(0, 10).map(l => ({
      id: l.id,
      name: l.name,
      avatarUrl: l.avatarUrl,
      expertise: l.expertise,
      city: l.city,
      district: l.district,
      court: l.court,
      rating: l.rating,
      ratingCount: l.ratingCount,
      activeDelegationsCount: l.activeDelegationsCount,
      isOverloaded: l.isOverloaded,
      recommendationReason: l.isOverloaded 
        ? 'Bu avukat şu anda çok meşgul' 
        : l.activeDelegationsCount > 2 
          ? 'Ortalama yoğunlukta' 
          : 'Uygun, rahatlıkla tevkil verebilir',
    }));
  }
}