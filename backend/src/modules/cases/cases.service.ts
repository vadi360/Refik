// ============================================================================
// Cases Servisi (cases.service.ts)
// Açıklama: Dava dosyası CRUD ve ilişkili işlemler
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;
    
    const where: any = { userId, deletedAt: null };
    if (status) where.status = status;

    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        include: {
          hearings: { orderBy: { hearingDate: 'desc' }, take: 1 },
          _count: { select: { notifications: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const caseData = await this.prisma.case.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        hearings: { orderBy: { hearingDate: 'desc' } },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
        documents: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!caseData) throw new NotFoundException('Dosya bulunamadı');
    return caseData;
  }

  async create(userId: string, data: { caseNumber: string; court?: string; parties?: any; subject?: string }) {
    return this.prisma.case.create({
      data: {
        userId,
        caseNumber: data.caseNumber,
        court: data.court,
        parties: data.parties ? JSON.stringify(data.parties) : null,
        subject: data.subject,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, userId: string, data: Partial<{ court: string; parties: any; subject: string; status: string; aiSummary: string }>) {
    const existing = await this.prisma.case.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Dosya bulunamadı');

    return this.prisma.case.update({
      where: { id },
      data: {
        ...data,
        parties: data.parties ? JSON.stringify(data.parties) : undefined,
      },
    });
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.case.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Dosya bulunamadı');

    return this.prisma.case.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getHearings(caseId: string, userId: string) {
    const caseData = await this.prisma.case.findFirst({ where: { id: caseId, userId } });
    if (!caseData) throw new NotFoundException('Dosya bulunamadı');

    return this.prisma.hearing.findMany({
      where: { caseId },
      orderBy: { hearingDate: 'desc' },
    });
  }

  async addHearing(caseId: string, userId: string, data: { hearingDate: Date; court?: string; notes?: string }) {
    const caseData = await this.prisma.case.findFirst({ where: { id: caseId, userId } });
    if (!caseData) throw new NotFoundException('Dosya bulunamadı');

    return this.prisma.hearing.create({
      data: { caseId, hearingDate: data.hearingDate, court: data.court, notes: data.notes },
    });
  }

  async updateHearing(caseId: string, hearingId: string, userId: string, data: { hearingDate?: Date; court?: string; notes?: string; status?: string }) {
    const caseData = await this.prisma.case.findFirst({ where: { id: caseId, userId } });
    if (!caseData) throw new NotFoundException('Dosya bulunamadı');

    const hearing = await this.prisma.hearing.findFirst({ where: { id: hearingId, caseId } });
    if (!hearing) throw new NotFoundException('Duruşma bulunamadı');

    return this.prisma.hearing.update({
      where: { id: hearingId },
      data: {
        hearingDate: data.hearingDate || hearing.hearingDate,
        court: data.court !== undefined ? data.court : hearing.court,
        notes: data.notes !== undefined ? data.notes : hearing.notes,
        status: data.status ? (data.status as any) : hearing.status,
      },
    });
  }

  async deleteHearing(caseId: string, hearingId: string, userId: string) {
    const caseData = await this.prisma.case.findFirst({ where: { id: caseId, userId } });
    if (!caseData) throw new NotFoundException('Dosya bulunamadı');

    const hearing = await this.prisma.hearing.findFirst({ where: { id: hearingId, caseId } });
    if (!hearing) throw new NotFoundException('Duruşma bulunamadı');

    await this.prisma.hearing.delete({ where: { id: hearingId } });
  }
}