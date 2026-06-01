// ============================================================================
// Case Update Module (case-update.module.ts)
// Açıklama: Dosya güncelleme, AI analiz ve otomatik hatırlatıcı modülü
// 
// Bu modül:
// 1. CaseUpdateService - AI analiz ve güncelleme işlemleri
// 2. CaseUpdateController - API endpoint'leri
// 3. Bağımlılıklar: PrismaService, AiService, RemindersService, FcmService
// 
// Modüller:
// - case-update (bu modül)
//   ├── case-update.service.ts
//   ├── case-update.controller.ts
//   └── dto/
//       └── case-update.dto.ts
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { RemindersModule } from '../reminders/reminders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CaseUpdateService } from './case-update.service';
import { CaseUpdateController } from './case-update.controller';

@Module({
  imports: [
    PrismaModule,      // Veritabanı erişimi
    AiModule,          // AI servisleri (Minimax, Claude)
    RemindersModule,   // Hatırlatıcı oluşturma
    NotificationsModule,// Bildirim servisi (FCM)
  ],
  controllers: [CaseUpdateController],
  providers: [CaseUpdateService],
  exports: [CaseUpdateService],
})
export class CaseUpdateModule {}

// ============================================================================
// MODÜL AÇIKLAMASI
// ============================================================================
/*
Bu modül aşağıdaki işlevleri sağlar:

1. DOSYA GÜNCELLEME (POST /ai/case-update)
   - Yeni içerik eklendiğinde AI analizi
   - Mevcut özeti günceller
   - Yapılacaklar önerisi oluşturur
   - Hatırlatıcı oluşturur
   - Kronolojik güncelleme kaydeder

2. YAPILACAKLAR YÖNETİMİ
   - GET /ai/case-update/:caseId/actions - Listele
   - PUT /ai/case-update/actions - Durum güncelle
   - POST /ai/case-update/:caseId/actions - Ekle
   - DELETE /ai/case-update/:caseId/actions/:index - Sil

3. KRONOLOJİ
   - GET /ai/case-update/:caseId/timeline - Gelişmeleri getir

4. YENİDEN ÖZETLEME
   - POST /ai/case-update/:caseId/summarize - Tüm dosyayı özetle

KULLANIM SENARYOLARI:
- UYAP'tan yeni belge eklendiğinde
- Tebligat geldiğinde (otomatik 5 gün kuralı)
- Duruşma sonucu girildiğinde
- Karar eklendiğinde
- Manual olarak yapılacak eklendiğinde

DATABASE:
- Case modeline yeni alanlar eklendi:
  - actionItems: JSON (yapılacaklar listesi)
  - timelineUpdates: JSON (kronolojik gelişmeler)
*/