// ============================================================================
// Reminders Servisi (reminders.service.ts)
// Açıklama: Hatırlatıcı işlemleri servisi
// ============================================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: { status?: string; caseId?: string }) {
    const where: any = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.caseId) where.caseId = filters.caseId;
    return this.prisma.reminder.findMany({ where, orderBy: { dueDate: 'asc' } });
  }

  async create(userId: string, data: { caseId?: string; notificationId?: string; type: string; title: string; description?: string; dueDate: Date; remindAt?: Date; notifyTypes?: string[] }) {
    return this.prisma.reminder.create({
      data: { userId, caseId: data.caseId || null, notificationId: data.notificationId || null, type: data.type as any, title: data.title, description: data.description, dueDate: data.dueDate, remindAt: data.remindAt, notifyTypes: data.notifyTypes || ['push', 'email'] },
    });
  }

  async markComplete(id: string, userId: string) {
    const reminder = await this.prisma.reminder.findFirst({ where: { id, userId } });
    if (!reminder) throw new NotFoundException('Hatırlatıcı bulunamadı');
    return this.prisma.reminder.update({ where: { id }, data: { isCompleted: true, status: 'COMPLETED', completedAt: new Date() } });
  }

  async delete(id: string, userId: string) {
    const reminder = await this.prisma.reminder.findFirst({ where: { id, userId } });
    if (!reminder) throw new NotFoundException('Hatırlatıcı bulunamadı');
    return this.prisma.reminder.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async update(id: string, userId: string, data: { title?: string; description?: string; dueDate?: string; remindAt?: string; status?: string }) {
    const reminder = await this.prisma.reminder.findFirst({ where: { id, userId } });
    if (!reminder) throw new NotFoundException('Hatırlatıcı bulunamadı');
    
    return this.prisma.reminder.update({
      where: { id },
      data: {
        title: data.title || reminder.title,
        description: data.description !== undefined ? data.description : reminder.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : reminder.dueDate,
        remindAt: data.remindAt ? new Date(data.remindAt) : reminder.remindAt,
        status: data.status ? (data.status as any) : reminder.status,
      },
    });
  }
}