// ============================================================================
// Users Servisi (users.service.ts)
// Açıklama: Kullanıcı işlemleri servisi
// 
// Bu servis:
// 1. Profil bilgilerini getirir
// 2. Profil günceller (name, avatar, expertise, vs.)
// 3. Şifre değiştirme işlemini yönetir
// 4. Avukat arama işlevini sağlar (tevkil için)
// 5. Puanlama ve değerlendirme işlemlerini yönetir
// ============================================================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Profil Bilgilerini Getir
   * 
   * Giriş yapmış kullanıcının kendi profil bilgilerini getirir
   * Şifre hash'i döndürülmez (güvenlik)
   * 
   * @param userId - Kullanıcı ID'si
   * @returns Profil bilgileri
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneVerified: true,
        avatarUrl: true,
        baroReg: true,
        expertise: true,
        city: true,
        district: true,
        court: true,
        rating: true,
        ratingCount: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  /**
   * Profil Güncelle
   * 
   * Kullanıcının profil bilgilerini günceller
   * Güncellenebilir alanlar: name, avatar, expertise, city, district, court
   * 
   * @param userId - Kullanıcı ID'si
   * @param updateData - Güncelleme verileri
   */
  async updateProfile(userId: string, updateData: {
    name?: string;
    avatarUrl?: string;
    expertise?: string[];
    city?: string;
    district?: string;
    court?: string;
  }) {
    // Kullanıcının varlığını kontrol et
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Profili güncelle
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateData.name,
        avatarUrl: updateData.avatarUrl,
        expertise: updateData.expertise,
        city: updateData.city,
        district: updateData.district,
        court: updateData.court,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        expertise: true,
        city: true,
        district: true,
        court: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATE',
        entityType: 'users',
        entityId: userId,
      },
    });

    return updatedUser;
  }

  /**
   * Şifre Değiştir
   * 
   * Kullanıcının mevcut şifresini doğrulayarak yeni şifre belirler
   * 
   * @param userId - Kullanıcı ID'si
   * @param currentPassword - Mevcut şifre
   * @param newPassword - Yeni şifre
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Mevcut şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ConflictException('Mevcut şifre yanlış');
    }

    // Yeni şifreyi hashle ve güncelle
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGE',
        entityType: 'users',
        entityId: userId,
      },
    });

    return { message: 'Şifre başarıyla değiştirildi' };
  }

  /**
   * Avukat Ara
   * 
   * Tevkil için uygun avukatları arar
   * Filtreler: şehir, ilçe, uzmanlık alanı, puan
   * 
   * @param filters - Arama filtreleri
   */
  async searchLawyers(filters: {
    city?: string;
    district?: string;
    expertise?: string;
    page?: number;
    limit?: number;
  }) {
    const { city, district, expertise, page = 1, limit = 20 } = filters;

    // Prisma'nın where clause'ını oluştur
    const where: any = {
      deletedAt: null, // Silinmemiş kullanıcılar
      subscriptionStatus: { not: 'free' }, // En az basic paket
    };

    if (city) where.city = city;
    if (district) where.district = district;

    // Uzmanlık alanı filtrelemesi
    if (expertise) {
      where.expertise = { hasSome: [expertise] };
    }

    // Avukatları getir
    const [lawyers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true,
          district: true,
          court: true,
          expertise: true,
          rating: true,
          ratingCount: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' }, // Puanı yüksek olanlar önce
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      lawyers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Kullanıcı Getir (Public)
   * 
   * Herkesin erişebileceği kullanıcı profil bilgileri
   * (Avukat arama, tevkil onayı için)
   * 
   * @param userId - Kullanıcı ID'si
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  /**
   * Avatar Güncelle
   * 
   * Kullanıcının profil fotoğrafını günceller
   * 
   * @param userId - Kullanıcı ID'si
   * @param avatarUrl - Yeni avatar URL'i
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return { avatarUrl };
  }
}