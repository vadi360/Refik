// ============================================================================
// Documents Servisi (documents.service.ts)
// Açıklama: Belge işlemleri servisi
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: { type?: string; caseId?: string; page?: number; limit?: number }) {
    const { type, caseId, page = 1, limit = 20 } = filters;
    const where: any = { userId, deletedAt: null };
    if (type) where.type = type;
    if (caseId) where.caseId = caseId;

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.document.count({ where }),
    ]);

    return { documents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, userId: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, userId, deletedAt: null } });
    if (!doc) throw new NotFoundException('Belge bulunamadı');
    return doc;
  }

  async create(userId: string, data: { caseId?: string; type: string; title: string; content?: string; fileUrl?: string; aiModelUsed?: string }) {
    return this.prisma.document.create({
      data: { userId, caseId: data.caseId || null, type: data.type as any, title: data.title, content: data.content, fileUrl: data.fileUrl, aiModelUsed: data.aiModelUsed, status: 'DRAFT' },
    });
  }

  async update(id: string, userId: string, data: Partial<{ title: string; content: string; status: string }>) {
    const doc = await this.prisma.document.findFirst({ where: { id, userId, deletedAt: null } });
    if (!doc) throw new NotFoundException('Belge bulunamadı');
    return this.prisma.document.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, userId } });
    if (!doc) throw new NotFoundException('Belge bulunamadı');
    return this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}