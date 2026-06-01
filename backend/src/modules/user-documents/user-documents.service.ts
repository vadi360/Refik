// ============================================================================
// Kullanıcı Evrakları Servisi (user-documents.service.ts)
// Açıklama: Avukatların özlük dosyalarını saklama servisi
// 
// Bu servis:
// 1. Avukatların kimlik, vergi levhası, baro belgesi gibi evraklarını saklar
// 2. Admin onay sürecini yönetir
// 3. Evrak türlerini kategorize eder
// 4. Belge geçmişini tutar
// 
// Admin Onay Süreci:
// 1. Avukat kayıt olur
// 2. Evrakları yükler (kimlik, baro belgesi, vergi levhası, vb.)
// 3. Admin panelden evrakları inceler ve onaylar/reddeder
// 4. Onay sonrası abonelik aktif edilir
// 
// Saklanan Belge Türleri:
// - Kimlik (TC Kimlik fotokopisi)
// - Baro Kayıt Belgesi
// - Vergi Levhası
// - İmza Sirküleri
// - Diploma
// - Noter Sözleşmesi (varsa)
// - Diğer evraklar
// ============================================================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Evrak türleri
 */
export enum DocumentCategory {
  IDENTITY = 'identity',         // TC Kimlik fotokopisi
  BARO_CERTIFICATE = 'baro',    // Baro kayıt belgesi
  TAX_PLAQUE = 'tax_plaque',     // Vergi levhası
  SIGNATURE_CIRCLE = 'signature', // İmza sirküleri
  DIPLOMA = 'diploma',           // Diploma
  NOTARY_CONTRACT = 'notary',    // Noter sözleşmesi
  PROXY = 'proxy',               // Vekilname
  OTHER = 'other',               // Diğer
}

/**
 * Evrak onay durumları
 */
export enum VerificationStatus {
  PENDING = 'pending',       // Beklemede
  APPROVED = 'approved',     // Onaylandı
  REJECTED = 'rejected',      // Reddedildi
  REVISION = 'revision',     // Revizyon istendi
}

@Injectable()
export class UserDocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Evrak Yükle
   * 
   * Kullanıcının özlük dosyasına yeni evrak ekler
   * 
   * @param userId - Kullanıcı ID
   * @param category - Evrak kategorisi
   * @param fileUrl - Dosya URL (R2'de saklanan)
   * @param originalName - Orijinal dosya adı
   */
  async uploadDocument(
    userId: string,
    category: DocumentCategory,
    fileUrl: string,
    originalName: string,
  ): Promise<any> {
    // Evrak kaydı oluştur
    const doc = await this.prisma.userDocument.create({
      data: {
        userId,
        category,
        fileUrl,
        originalName,
        status: VerificationStatus.PENDING,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_DOCUMENT_UPLOADED',
        entityType: 'user_documents',
        entityId: doc.id,
        newValue: { category, originalName } as any,
      },
    });

    return doc;
  }

  /**
   * Evrakları Listele
   * 
   * Kullanıcının tüm evraklarını getirir
   */
  async getUserDocuments(userId: string): Promise<any[]> {
    return this.prisma.userDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Evrak Detay
   */
  async getDocument(documentId: string): Promise<any> {
    const doc = await this.prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Evrak bulunamadı');
    }

    return doc;
  }

  /**
   * Evrak Sil
   * 
   * Kullanıcı kendi evrağını silebilir (onaylanmamışsa)
//admin onayladıysa silinemez
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const doc = await this.prisma.userDocument.findFirst({
      where: { id: documentId, userId },
    });

    if (!doc) {
      throw new NotFoundException('Evrak bulunamadı veya erişim yetkiniz yok');
    }

    // Onaylanmış belgeler silinemez
    if (doc.status === VerificationStatus.APPROVED) {
      throw new BadRequestException('Onaylanmış belgeler silinemez');
    }

    await this.prisma.userDocument.delete({
      where: { id: documentId },
    });
  }

  /**
   * Admin: Onay Bekleyen Evrakları Listele
   */
  async getPendingDocuments(): Promise<any[]> {
    return this.prisma.userDocument.findMany({
      where: { status: VerificationStatus.PENDING },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // En eski en önce
    });
  }

  /**
   * Admin: Evrak Onayla
   */
  async approveDocument(
    adminId: string,
    documentId: string,
    notes?: string,
  ): Promise<any> {
    const doc = await this.prisma.userDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!doc) {
      throw new NotFoundException('Evrak bulunamadı');
    }

    // Evrağı onayla
    const updated = await this.prisma.userDocument.update({
      where: { id: documentId },
      data: {
        status: VerificationStatus.APPROVED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        adminNotes: notes,
      },
    });

    // Kullanıcıya bildirim gönder
    await this.prisma.notification.create({
      data: {
        userId: doc.userId,
        type: 'SYSTEM',
        title: '✅ Evrak Onaylandı',
        content: `${this.getCategoryLabel(doc.category)} onaylandı.`,
        isRead: false,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_DOCUMENT_APPROVED',
        entityType: 'user_documents',
        entityId: documentId,
        newValue: { approvedDocument: doc.category } as any,
      },
    });

    // Tüm zorunlu evraklar onaylandı mı kontrol et
    await this.checkAndActivateUser(doc.userId);

    return updated;
  }

  /**
   * Admin: Evrak Reddet
   */
  async rejectDocument(
    adminId: string,
    documentId: string,
    reason: string,
  ): Promise<any> {
    const doc = await this.prisma.userDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!doc) {
      throw new NotFoundException('Evrak bulunamadı');
    }

    // Evrağı reddet
    const updated = await this.prisma.userDocument.update({
      where: { id: documentId },
      data: {
        status: VerificationStatus.REJECTED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        adminNotes: reason,
      },
    });

    // Kullanıcıya bildirim gönder
    await this.prisma.notification.create({
      data: {
        userId: doc.userId,
        type: 'SYSTEM',
        title: '❌ Evrak Reddedildi',
        content: `${this.getCategoryLabel(doc.category)} reddedildi. Sebep: ${reason}`,
        isRead: false,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_DOCUMENT_REJECTED',
        entityType: 'user_documents',
        entityId: documentId,
        newValue: { rejectedDocument: doc.category, reason } as any,
      },
    });

    return updated;
  }

  /**
   * Admin: Revizyon İste
   */
  async requestRevision(
    adminId: string,
    documentId: string,
    notes: string,
  ): Promise<any> {
    const doc = await this.prisma.userDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!doc) {
      throw new NotFoundException('Evrak bulunamadı');
    }

    // Evrağı revizyon durumuna al
    const updated = await this.prisma.userDocument.update({
      where: { id: documentId },
      data: {
        status: VerificationStatus.REVISION,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        adminNotes: notes,
      },
    });

    // Kullanıcıya bildirim gönder
    await this.prisma.notification.create({
      data: {
        userId: doc.userId,
        type: 'SYSTEM',
        title: '📝 Revizyon Gerekli',
        content: `${this.getCategoryLabel(doc.category)} için revizyon istendi. Not: ${notes}`,
        isRead: false,
      },
    });

    return updated;
  }

  /**
   * Kullanıcının tüm zorunlu evraklarının onaylı olup olmadığını kontrol et
   */
  async checkAndActivateUser(userId: string): Promise<boolean> {
    // Zorunlu kategoriler
    const requiredCategories = [
      DocumentCategory.IDENTITY,
      DocumentCategory.BARO_CERTIFICATE,
    ];

    // Her kategorinin onaylı olup olmadığını kontrol et
    const approvedDocs = await this.prisma.userDocument.findMany({
      where: {
        userId,
        status: VerificationStatus.APPROVED,
        category: { in: requiredCategories },
      },
    });

    // Tüm zorunlu evraklar onaylandıysa kullanıcıyı aktive et
    if (approvedDocs.length >= requiredCategories.length) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      // Kullanıcıya hoş geldin bildirimi gönder
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM',
          title: '🎉 Hoş Geldiniz!',
          content: 'Refik hesabınız aktive edildi. Artık tüm özellikleri kullanabilirsiniz.',
          isRead: false,
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Kullanıcının doğrulama durumunu getir
   */
  async getVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    documents: any[];
    pendingCount: number;
    approvedCount: number;
  }> {
    const documents = await this.prisma.userDocument.findMany({
      where: { userId },
    });

    return {
      isVerified: documents.every(
        d => d.category !== DocumentCategory.IDENTITY && d.category !== DocumentCategory.BARO_CERTIFICATE
          ? true
          : d.status === VerificationStatus.APPROVED,
      ),
      documents,
      pendingCount: documents.filter(d => d.status === VerificationStatus.PENDING).length,
      approvedCount: documents.filter(d => d.status === VerificationStatus.APPROVED).length,
    };
  }

  /**
   * Kategori etiketini getir
   */
  private getCategoryLabel(category: DocumentCategory): string {
    const labels: Record<DocumentCategory, string> = {
      [DocumentCategory.IDENTITY]: 'Kimlik Belgesi',
      [DocumentCategory.BARO_CERTIFICATE]: 'Baro Kayıt Belgesi',
      [DocumentCategory.TAX_PLAQUE]: 'Vergi Levhası',
      [DocumentCategory.SIGNATURE_CIRCLE]: 'İmza Sirküleri',
      [DocumentCategory.DIPLOMA]: 'Diploma',
      [DocumentCategory.NOTARY_CONTRACT]: 'Noter Sözleşmesi',
      [DocumentCategory.PROXY]: 'Vekilname',
      [DocumentCategory.OTHER]: 'Diğer Evrak',
    };

    return labels[category] || 'Bilinmeyen';
  }
}