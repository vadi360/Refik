// ============================================================================
// Case Update DTOs (case-update.dto.ts)
// Açıklama: Dosya güncelleme (yeni belge/ekleme) için kullanılan DTO'lar
// 
// Bu DTO'lar:
// 1. Yeni belge veya ekleme bilgisini alır
// 2. Dosya ID ve içerik türünü belirler
// 3. AI analiz sonuçlarını döndürür
// 
// Kullanım:
// - Yeni tebligat eklendiğinde
// - Dosyaya yeni belge eklendiğinde
// - Duruşma sonucu eklendiğinde
// - Yapılacaklar güncellendiğinde
// ============================================================================

import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// İçerik türleri
export enum ContentType {
  NOTIFICATION = 'notification',           // Tebligat
  DOCUMENT = 'document',                   // Belge/Dilekçe
  HEARING_RESULT = 'hearing_result',       // Duruşma sonucu
  DECISION = 'decision',                   // Karar
  COMPLAINT = 'complaint',                 // Şikayet
  PAYMENT = 'payment',                     // Ödeme
  OTHER = 'other',                         // Diğer
}

// Dosya güncelleme isteği
export class CaseUpdateRequestDto {
  @ApiProperty({
    description: 'Dosya ID',
    example: 'uuid-xxx-xxx',
  })
  @IsString()
  @IsNotEmpty()
  caseId!: string;

  @ApiProperty({
    description: 'Yeni içerik (metin)',
    example: 'Davalı itiraz dilekçesi sundu, 15 gün içinde cevap verilmeli...',
  })
  @IsString()
  @IsNotEmpty()
  newContent!: string;

  @ApiProperty({
    description: 'İçerik türü',
    enum: ContentType,
    example: ContentType.NOTIFICATION,
  })
  @IsEnum(ContentType)
  contentType!: ContentType;

  @ApiPropertyOptional({
    description: 'Ek başlık veya konu',
    example: 'Davalı İtiraz Dilekçesi',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Ek içerik (metadata)',
    example: { source: 'UETS', documentType: 'dilekçe' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

// AI tarafından önerilen yapılacaklar
export class ActionItemDto {
  @ApiProperty({
    description: 'Yapılacak görev',
    example: 'Davalıya cevap dilekçesi hazırla',
  })
  task!: string;

  @ApiPropertyOptional({
    description: 'Açıklama',
    example: 'İtiraz dilekçesine karşı 15 gün içinde cevap verilmeli',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Bitiş tarihi',
    example: '2026-06-17',
  })
  @IsString()
  @IsNotEmpty()
  deadline!: string;

  @ApiPropertyOptional({
    description: 'Hatırlatma tarihi',
    example: '2026-06-12',
  })
  @IsString()
  @IsOptional()
  reminderDate?: string;

  @ApiProperty({
    description: 'Öncelik',
    enum: ['high', 'medium', 'low'],
    example: 'high',
  })
  @IsString()
  @IsNotEmpty()
  priority!: 'high' | 'medium' | 'low';
}

// Kronolojik gelişme
export class TimelineUpdateDto {
  @ApiProperty({
    description: 'Tarih',
    example: '2026-06-02',
  })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({
    description: 'Gelişme türü',
    enum: ContentType,
    example: ContentType.NOTIFICATION,
  })
  @IsEnum(ContentType)
  type!: ContentType;

  @ApiProperty({
    description: 'Gelişme açıklaması',
    example: 'Davalı itiraz dilekçesi sundu',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: 'Detay',
    example: '15 gün içinde cevap verilmeli',
  })
  @IsString()
  @IsOptional()
  details?: string;
}

// Dosya güncelleme yanıtı
export class CaseUpdateResponseDto {
  @ApiProperty({
    description: 'Güncellenmiş özet',
    example: 'Alacak davası. Son gelişme: Davalı itiraz dilekçesi sundu (02.06.2026).',
  })
  summary!: string;

  @ApiProperty({
    description: 'Mevcut yapılacaklar',
    type: [ActionItemDto],
  })
  actionItems!: ActionItemDto[];

  @ApiProperty({
    description: 'Oluşturulan hatırlatıcılar',
    type: [Object],
  })
  reminders!: any[];

  @ApiProperty({
    description: 'Kronolojik güncellemeler',
    type: [TimelineUpdateDto],
  })
  timeline!: TimelineUpdateDto[];

  @ApiProperty({
    description: 'Kullanılan AI modeli',
    example: 'MINIMAX',
  })
  model!: string;

  @ApiProperty({
    description: 'Güven skoru',
    example: 0.85,
  })
  confidence!: number;
}

// Mevcut yapılacakları getirme isteği
export class GetActionItemsRequestDto {
  @ApiProperty({
    description: 'Dosya ID',
    example: 'uuid-xxx-xxx',
  })
  @IsString()
  @IsNotEmpty()
  caseId!: string;
}

// Yapılacakları güncelleme isteği
export class UpdateActionItemDto {
  @ApiProperty({
    description: 'Yapılacak ID',
    example: 'uuid-xxx-xxx',
  })
  @IsString()
  @IsNotEmpty()
  actionItemId!: string;

  @ApiPropertyOptional({
    description: 'Yeni durum',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    example: 'completed',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Açıklama veya not',
    example: 'Dilekçe hazırlandı ve mahkemeye sunuldu',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Yapılacaklar listesi yanıtı
export class ActionItemsResponseDto {
  @ApiProperty({
    description: 'Yapılacaklar',
    type: [Object],
  })
  actionItems!: any[];

  @ApiProperty({
    description: 'Toplam sayı',
    example: 3,
  })
  total!: number;
}