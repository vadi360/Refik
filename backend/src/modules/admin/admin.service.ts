// ============================================================================
// Admin Servisi (admin.service.ts)
// Açıklama: Yönetici işlemleri servisi
// 
// Bu servis:
// 1. Tüm kullanıcıları listeleme
// 2. Kullanıcı güncelleme/silme
// 3. AI yapılandırma yönetimi
// 4. Sistem istatistikleri
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm Kullanıcıları Getir
   */
  async getAllUsers(filters: { page?: number; limit?: number; search?: string; status?: string }) {
    const { page = 1, limit = 20, search, status } = filters;

    const where: any = { deletedAt: null };
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }];
    if (status) where.subscriptionStatus = status;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, phone: true, subscriptionStatus: true, rating: true, ratingCount: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  /**
   * Kullanıcı Güncelle (Admin)
   */
  async updateUser(userId: string, data: { subscriptionStatus?: string; rating?: number; ratingCount?: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    return this.prisma.user.update({ where: { id: userId }, data });
  }

  /**
   * Kullanıcı Sil (Soft Delete)
   */
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    return this.prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  }

  /**
   * AI Yapılandırma Getir
   */
  async getAiConfig() {
    return this.prisma.aiConfig.findMany({ orderBy: { priority: 'asc' } });
  }

  /**
   * AI Görev Yapılandırma Güncelle
   */
  async updateAiConfig(taskName: string, model: string, updatedById: string) {
    const config = await this.prisma.aiConfig.findUnique({ where: { taskName } });
    if (!config) throw new NotFoundException('AI görevi bulunamadı');

    // Eski modeli kaydet (history için)
    await this.prisma.aiConfigUpdate.create({
      data: { configId: config.id, oldModel: config.model, newModel: model, updatedById },
    });

    return this.prisma.aiConfig.update({ where: { taskName }, data: { model: model as any, updatedById } });
  }

  /**
   * Sistem İstatistikleri
   */
  async getStats() {
    const [totalUsers, activeUsers, totalCases, totalDelegations, totalDocuments, totalNotifications] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, subscriptionStatus: { not: 'free' } } }),
      this.prisma.case.count({ where: { deletedAt: null } }),
      this.prisma.delegation.count({ where: { deletedAt: null } }),
      this.prisma.document.count({ where: { deletedAt: null } }),
      this.prisma.notification.count({ where: { deletedAt: null } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      cases: { total: totalCases },
      delegations: { total: totalDelegations },
      documents: { total: totalDocuments },
      notifications: { total: totalNotifications },
    };
  }

  /**
   * Toplu Bildirim Gönder (Broadcast)
   */
  async broadcastNotification(title: string, content: string, userIds?: string[]) {
    const where = userIds?.length ? { id: { in: userIds }, deletedAt: null } : { deletedAt: null };

    const users = await this.prisma.user.findMany({ where, select: { id: true } });

    const notifications = users.map(u => ({
      userId: u.id,
      type: 'SYSTEM' as const,
      title,
      content,
    }));

    return this.prisma.notification.createMany({ data: notifications });
  }
}