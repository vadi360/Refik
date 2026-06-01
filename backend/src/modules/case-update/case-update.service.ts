// ============================================================================
// Case Update Servisi (case-update.service.ts)
// Açıklama: Dosya güncelleme, AI analiz ve otomatik hatırlatıcı oluşturma
// 
// Bu servis:
// 1. Dosyaya yeni içerik eklendiğinde AI ile analiz eder
// 2. Mevcut özeti günceller ve kronolojiye ekler
// 3. Yapılacaklar önerisi çıkarır
// 4. Otomatik hatırlatıcı oluşturur
// 5. Yapılacaklar listesini yönetir (güncelle, tamamla, iptal et)
// 
// Kullanım Senaryoları:
// - UYAP'tan yeni belge eklendiğinde
// - Tebligat geldiğinde (otomatik 5 gün kuralı)
// - Duruşma sonucu girildiğinde
// - Karar eklendiğinde
// ============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { RemindersService } from '../reminders/reminders.service';
import { FcmService } from '../notifications/services/fcm.service';
import {
  CaseUpdateRequestDto,
  CaseUpdateResponseDto,
  ActionItemDto,
  TimelineUpdateDto,
  ContentType,
  GetActionItemsRequestDto,
  UpdateActionItemDto,
  ActionItemsResponseDto,
} from './dto/case-update.dto';

@Injectable()
export class CaseUpdateService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private remindersService: RemindersService,
    private fcmService: FcmService,
  ) {}

  /**
   * Dosyayı Güncelle - Yeni İçerik Analizi
   * 
   * Yeni belge veya ekleme olduğunda:
   * 1. Mevcut dosya bilgilerini al
   * 2. AI ile yeni içeriği analiz et
   * 3. Mevcut özeti ve kronolojiyi güncelle
   * 4. Yapılacaklar önerisi çıkar
   * 5. Hatırlatıcı oluştur (gerekiyorsa)
   * 
   * @param dto - Güncelleme isteği
   * @param userId - Kullanıcı ID'si
   */
  async updateCase(
    dto: CaseUpdateRequestDto,
    userId: string,
  ): Promise<CaseUpdateResponseDto> {
    // 1. Dosyayı bul
    const caseData = await this.prisma.case.findFirst({
      where: {
        id: dto.caseId,
        userId,
        deletedAt: null,
      },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        hearings: {
          orderBy: { hearingDate: 'desc' },
          take: 10,
        },
        reminders: {
          orderBy: { dueDate: 'asc' },
          where: { status: { not: 'completed' } },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı veya erişim yetkiniz yok');
    }

    // 2. AI ile yeni içeriği analiz et
    const analysisResult = await this.performAIAnalysis(
      dto.newContent,
      dto.contentType,
      caseData.aiSummary || '',
      userId,
    );

    // 3. Yapılacaklar oluştur
    const actionItems = this.createActionItems(analysisResult, dto.contentType);
    
    // 4. Kronolojik güncelleme oluştur
    const timelineUpdate = this.createTimelineUpdate(dto, analysisResult);
    
    // 5. Hatırlatıcıları oluştur
    const reminders = await this.createReminders(
      actionItems,
      dto.caseId,
      userId,
    );

    // 6. Dosyayı güncelle (özet, yapılacaklar, kronoloji)
    const updatedCase = await this.prisma.case.update({
      where: { id: dto.caseId },
      data: {
        aiSummary: analysisResult.summary,
        actionItems: actionItems as any,
        timelineUpdates: {
          ...((caseData.timelineUpdates as any[]) || []),
          timelineUpdate,
        } as any,
      },
    });

    // 7. Kullanıcıya bildirim gönder
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (user?.pushToken) {
      await this.fcmService.sendToToken(user.pushToken, {
        title: `📁 ${caseData.caseNumber} - Yeni Gelişme`,
        body: this.truncateText(analysisResult.summary, 100),
        data: {
          type: 'case_update',
          caseId: dto.caseId,
        },
      });
    }

    // 8. Yanıtı döndür
    return {
      summary: analysisResult.summary,
      actionItems,
      reminders,
      timeline: [timelineUpdate],
      model: analysisResult.model,
      confidence: analysisResult.confidence,
    };
  }

  /**
   * AI ile İçerik Analizi
   * 
   * Yeni içeriği analiz eder:
   * - Özet günceller
   * - Yapılacaklar çıkarır
   * - Hatırlatıcı önerisi yapar
   */
  private async performAIAnalysis(
    newContent: string,
    contentType: ContentType,
    currentSummary: string,
    userId: string,
  ): Promise<{
    summary: string;
    actionItems: Array<{
      task: string;
      deadline: string;
      priority: string;
      description?: string;
    }>;
    reminderSuggestion?: {
      title: string;
      dueDate: string;
      remindAt: string;
    };
    model: string;
    confidence: number;
  }> {
    // İçerik türüne göre AI prompt hazırla
    const prompt = this.buildAnalysisPrompt(
      newContent,
      contentType,
      currentSummary,
    );

    // AI'a analiz isteği gönder (general_qa kullanabiliriz veya özel bir prompt)
    // Burada AI service üzerinden simple bir istek yapalım
    // Not: Bu özellik için aiService'e yeni bir method eklenebilir
    
    try {
      // AI'dan analiz iste
      // notification_summary görevi token limiti olmadan çalışır (UETS)
      // ama bu yeni içerik analizi için token kullanılacak
      // Bu yüzden general_qa veya case_summary kullanabiliriz
      
      const aiResponse = await this.aiService.processRequest(
        {
          taskType: 'case_summary',
          input: prompt,
          context: { source: 'case_update', contentType },
        },
        userId,
      );

      // AI yanıtını parse et
      return this.parseAIResponse(aiResponse.result, contentType);
    } catch (error) {
      // AI başarısız olursa basit bir özet oluştur
      return this.fallbackAnalysis(newContent, contentType);
    }
  }

  /**
   * AI Analiz Prompt'u Oluştur
   */
  private buildAnalysisPrompt(
    newContent: string,
    contentType: ContentType,
    currentSummary: string,
  ): string {
    const typeLabels: Record<ContentType, string> = {
      [ContentType.NOTIFICATION]: 'Tebligat',
      [ContentType.DOCUMENT]: 'Belge/Dilekçe',
      [ContentType.HEARING_RESULT]: 'Duruşma Sonucu',
      [ContentType.DECISION]: 'Mahkeme Kararı',
      [ContentType.COMPLAINT]: 'Şikayet',
      [ContentType.PAYMENT]: 'Ödeme Bilgisi',
      [ContentType.OTHER]: 'Diğer',
    };

    return `
Mevcut Dosya Özeti:
${currentSummary || 'Henüz özet yok'}

---
Yeni Eklenen İçerik (${typeLabels[contentType]}):
${newContent}

---
Lütfen şu formatta analiz yap:

1. GÜNCELLENMİŞ ÖZET: (Mevcut özeti ve yeni gelişmeyi birleştiren, kronolojik bir özet - 2-3 cümle)

2. YAPILACAKLAR: (varsa)
- Görev: [Yapılacak iş]
- Bitiş: [GG.AA.YYYY]
- Öncelik: [high/medium/low]
- Açıklama: [Detay]

3. HATIRLATICI ÖNERİSİ: (varsa)
- Başlık: [Hatırlatıcı başlığı]
- Tarih: [GG.AA.YYYY]
- Hatırlatma: [GG.AA.YYYY] (1-2 gün önce)

---

Kurallar:
- Eğer süre belirtilmişse (örn: "15 gün içinde") yapılacaklar ve hatırlatıcı ZORUNLU
- Öncelik: süre yakınsa high, 1-2 hafta varsa medium, uzunsa low
- Eğer sadece bilgi verildiyse (madde 1 sadece) yapılacaklar boş kalabilir
`;
  }

  /**
   * AI Yanıtını Parse Et
   */
  private parseAIResponse(
    aiResult: string,
    contentType: ContentType,
  ): any {
    // AI yanıtını yapılarına ayır
    // Bu basit bir parser, gerçek uygulamada daha sofistike olabilir
    
    const lines = aiResult.split('\n');
    let summary = '';
    const actionItems: any[] = [];
    let reminderSuggestion: any;

    let section = '';
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('1.') || trimmed.startsWith('GÜNCELLENMİŞ ÖZET:')) {
        section = 'summary';
        summary = trimmed.replace(/^[12]\.\s*/, '').replace('GÜNCELLENMİŞ ÖZET:', '').trim();
        continue;
      }
      
      if (trimmed.startsWith('2.') || trimmed.startsWith('YAPILACAKLAR:')) {
        section = 'actions';
        continue;
      }
      
      if (trimmed.startsWith('3.') || trimmed.startsWith('HATIRLATICI')) {
        section = 'reminder';
        continue;
      }

      if (section === 'summary') {
        summary += ' ' + trimmed;
      }
      
      if (section === 'actions' && trimmed.startsWith('-')) {
        // Parse action item
        const actionMatch = trimmed.match(/Görev:\s*(.+)/i);
        const deadlineMatch = trimmed.match(/Bitiş:\s*(\d+\.\d+\.\d+)/i);
        const priorityMatch = trimmed.match(/Öncelik:\s*(high|medium|low)/i);
        const descMatch = trimmed.match(/Açıklama:\s*(.+)/i);
        
        if (actionMatch) {
          const action: any = { task: actionMatch[1].trim() };
          if (deadlineMatch) action.deadline = deadlineMatch[1];
          if (priorityMatch) action.priority = priorityMatch[1];
          if (descMatch) action.description = descMatch[1];
          actionItems.push(action);
        }
      }
      
      if (section === 'reminder' && trimmed.startsWith('-')) {
        const titleMatch = trimmed.match(/Başlık:\s*(.+)/i);
        const dateMatch = trimmed.match(/Tarih:\s*(\d+\.\d+\.\d+)/i);
        const remindMatch = trimmed.match(/Hatırlatma:\s*(\d+\.\d+\.\d+)/i);
        
        if (titleMatch && dateMatch) {
          reminderSuggestion = {
            title: titleMatch[1].trim(),
            dueDate: dateMatch[1],
            remindAt: remindMatch ? remindMatch[1] : '',
          };
        }
      }
    }

    return {
      summary: summary.trim(),
      actionItems,
      reminderSuggestion,
      model: 'MINIMAX',
      confidence: 0.85,
    };
  }

  /**
   * Fallback Analysis (AI başarısız olursa)
   */
  private fallbackAnalysis(newContent: string, contentType: ContentType): any {
    const typeLabels: Record<ContentType, string> = {
      [ContentType.NOTIFICATION]: 'Yeni tebligat',
      [ContentType.DOCUMENT]: 'Yeni belge',
      [ContentType.HEARING_RESULT]: 'Duruşma sonucu',
      [ContentType.DECISION]: 'Yeni karar',
      [ContentType.COMPLAINT]: 'Şikayet',
      [ContentType.PAYMENT]: 'Ödeme',
      [ContentType.OTHER]: 'Yeni gelişme',
    };

    return {
      summary: `${typeLabels[contentType]} eklendi: ${this.truncateText(newContent, 200)}`,
      actionItems: [],
      reminderSuggestion: null,
      model: 'FALLBACK',
      confidence: 0.5,
    };
  }

  /**
   * Yapılacaklar Oluştur
   */
  private createActionItems(
    analysisResult: any,
    contentType: ContentType,
  ): ActionItemDto[] {
    if (!analysisResult.actionItems || analysisResult.actionItems.length === 0) {
      return [];
    }

    return analysisResult.actionItems.map((item: any) => ({
      task: item.task,
      description: item.description,
      deadline: item.deadline,
      reminderDate: item.reminderDate || this.calculateReminderDate(item.deadline),
      priority: (item.priority as 'high' | 'medium' | 'low') || 'medium',
    }));
  }

  /**
   * Kronolojik Güncelleme Oluştur
   */
  private createTimelineUpdate(
    dto: CaseUpdateRequestDto,
    analysisResult: any,
  ): TimelineUpdateDto {
    return {
      date: new Date().toLocaleDateString('tr-TR'),
      type: dto.contentType,
      description: this.truncateText(dto.newContent, 100),
      details: analysisResult.summary,
    };
  }

  /**
   * Hatırlatıcıları Oluştur
   */
  private async createReminders(
    actionItems: ActionItemDto[],
    caseId: string,
    userId: string,
  ): Promise<any[]> {
    const createdReminders = [];

    for (const item of actionItems) {
      if (item.deadline) {
        try {
          const dueDate = this.parseDate(item.deadline);
          const remindAt = item.reminderDate 
            ? this.parseDate(item.reminderDate) 
            : new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);

          const reminder = await this.remindersService.create({
            userId,
            caseId,
            type: 'DEADLINE' as any,
            title: item.task,
            dueDate,
            remindAt,
            notifyTypes: ['push', 'email'] as any,
          });

          createdReminders.push({
            id: reminder.id,
            title: reminder.title,
            dueDate: reminder.dueDate,
            remindAt: reminder.remindAt,
          });
        } catch (error) {
          console.error('Hatırlatıcı oluşturma hatası:', error);
        }
      }
    }

    return createdReminders;
  }

  /**
   * Hatırlatma Tarihini Hesapla
   */
  private calculateReminderDate(deadline: string): string {
    const dueDate = this.parseDate(deadline);
    const reminderDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 gün önce
    
    // Eğer 2 günden az kaldıysa 1 gün önce hatırlat
    const now = new Date();
    if (dueDate.getTime() - now.getTime() < 2 * 24 * 60 * 60 * 1000) {
      const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
      return oneDayBefore.toLocaleDateString('tr-TR');
    }
    
    return reminderDate.toLocaleDateString('tr-TR');
  }

  /**
   * Tarihi Parse Et (GG.AA.YYYY veya YYYY-MM-DD)
   */
  private parseDate(dateStr: string): Date {
    // GG.AA.YYYY formatı
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    // YYYY-MM-DD formatı
    return new Date(dateStr);
  }

  /**
   * Metni Kısalt
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // =========================================================================
  // YAPILACAKLAR YÖNETİMİ
  // =========================================================================

  /**
   * Dosyadaki Yapılacakları Getir
   */
  async getActionItems(
    dto: GetActionItemsRequestDto,
    userId: string,
  ): Promise<ActionItemsResponseDto> {
    const caseData = await this.prisma.case.findFirst({
      where: {
        id: dto.caseId,
        userId,
        deletedAt: null,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const actionItems = (caseData.actionItems as any[]) || [];

    return {
      actionItems,
      total: actionItems.length,
    };
  }

  /**
   * Yapılacak Durumunu Güncelle
   */
  async updateActionItem(
    dto: UpdateActionItemDto,
    userId: string,
  ): Promise<any> {
    const caseData = await this.prisma.case.findFirst({
      where: {
        id: dto.actionItemId, // Burada caseId yerine direkt case üzerinden işlem yapılacak
        userId,
        deletedAt: null,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    // Action items dizisini güncelle
    const actionItems = (caseData.actionItems as any[]) || [];
    const updatedItems = actionItems.map((item, index) => {
      if (index.toString() === dto.actionItemId) {
        return {
          ...item,
          status: dto.status || item.status,
          notes: dto.notes || item.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const updated = await this.prisma.case.update({
      where: { id: caseData.id },
      data: {
        actionItems: updatedItems as any,
      },
    });

    return {
      success: true,
      actionItems: updated.actionItems,
    };
  }

  /**
   * Yapılacak Ekle (Manual)
   */
  async addActionItem(
    caseId: string,
    userId: string,
    item: { task: string; deadline: string; priority: string; description?: string },
  ): Promise<any> {
    const caseData = await this.prisma.case.findFirst({
      where: { id: caseId, userId, deletedAt: null },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const actionItems = (caseData.actionItems as any[]) || [];
    actionItems.push({
      ...item,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        actionItems: actionItems as any,
      },
    });

    // Hatırlatıcı oluştur
    const dueDate = this.parseDate(item.deadline);
    await this.remindersService.create({
      userId,
      caseId,
      type: 'DEADLINE' as any,
      title: item.task,
      dueDate,
      remindAt: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000),
      notifyTypes: ['push', 'email'] as any,
    });

    return {
      success: true,
      actionItems: updated.actionItems,
    };
  }

  /**
   * Yapılacak Sil
   */
  async deleteActionItem(
    caseId: string,
    actionItemIndex: string,
    userId: string,
  ): Promise<any> {
    const caseData = await this.prisma.case.findFirst({
      where: { id: caseId, userId, deletedAt: null },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const actionItems = (caseData.actionItems as any[]) || [];
    const index = parseInt(actionItemIndex);
    
    if (index < 0 || index >= actionItems.length) {
      throw new BadRequestException('Geçersiz yapılacak index');
    }

    actionItems.splice(index, 1);

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        actionItems: actionItems as any,
      },
    });

    return {
      success: true,
      actionItems: updated.actionItems,
    };
  }

  /**
   * Kronolojiyi Getir
   */
  async getTimeline(caseId: string, userId: string): Promise<any[]> {
    const caseData = await this.prisma.case.findFirst({
      where: { id: caseId, userId, deletedAt: null },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    return (caseData.timelineUpdates as any[]) || [];
  }

  /**
   * Dosyayı Yeniden Özetle
   * 
   * Tüm mevcut içerikleri (tebligatlar, belgeler, duruşmalar, kararlar) analiz ederek
   * kapsamlı bir özet oluşturur
   */
  async resummarizeCase(caseId: string, userId: string): Promise<{
    summary: string;
    model: string;
    confidence: number;
  }> {
    // 1. Dosyayı bul
    const caseData = await this.prisma.case.findFirst({
      where: { id: caseId, userId, deletedAt: null },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        hearings: {
          orderBy: { hearingDate: 'desc' },
          take: 20,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    // 2. Tüm içerikleri birleştir
    let fullContent = `Dosya Numarası: ${caseData.caseNumber}\n`;
    if (caseData.court) fullContent += `Mahkeme: ${caseData.court}\n`;
    if (caseData.subject) fullContent += `Konu: ${caseData.subject}\n`;
    fullContent += '\n=== DURUŞMALAR ===\n';
    for (const h of caseData.hearings) {
      fullContent += `- ${h.hearingDate.toLocaleDateString('tr-TR')}: ${h.result || 'Sonuç yok'}\n`;
    }
    fullContent += '\n=== TEBLIGATLAR ===\n';
    for (const n of caseData.notifications) {
      fullContent += `- ${n.title}: ${n.content?.substring(0, 200) || ''}\n`;
    }
    if (caseData.aiSummary) {
      fullContent += '\n=== MEVCUT ÖZET ===\n' + caseData.aiSummary;
    }

    // 3. AI ile özetle
    try {
      const result = await this.aiService.processRequest(
        {
          taskType: 'case_summary',
          input: fullContent,
          context: { source: 'resummarize', caseId },
        },
        userId,
      );

      // 4. Özeti kaydet
      await this.prisma.case.update({
        where: { id: caseId },
        data: { aiSummary: result.result },
      });

      return {
        summary: result.result,
        model: result.model,
        confidence: result.confidence || 0.85,
      };
    } catch (error) {
      throw new BadRequestException('Özetleme başarısız: ' + (error as Error).message);
    }
  }
}