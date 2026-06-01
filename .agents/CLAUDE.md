# Refik — Claude Code Kullanım Yönergeleri

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**Proje:** Refik - Türkiye Hukuk Asistanı  
**Stack:** Node.js/NestJS, PostgreSQL/Prisma, AI (Minimax + Claude)

---

## 1. Proje Özeti

### 1.1 Nedir?
Refik, Türkiye'deki avukatlara yönelik:
- Mobil öncelikli AI asistan
- Tevkil pazarı (avukatlar arası duruşma devri)
- UETS tebligat takibi (5 gün kuralı)
- UYAP dosya özetleme (Chrome eklentisi)
- Otomatik belge üretimi (dilekçe, ihtarname)
- İcra takibi
- Takvim yönetimi

### 1.2 Hedef Kitle
- Solo avukatlar (5 yıllık deneyim)
- Küçük hukuk büroları (4 kişiye kadar)
- Türkiye geneli

### 1.3 Fiyatlandırma
| Paket | Fiyat | Token Limit |
|-------|-------|-------------|
| Basic | 199₺/ay | 1.000 |
| Standard | 499₺/ay | 3.000 |
| Professional | 999₺/ay | 10.000 |
| Enterprise | 1.999₺/ay | 50.000 |

---

## 2. Teknik Mimari

### 2.1 Teknoloji Stack
- **Backend:** Node.js + NestJS + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Minimax M2.7 (Türkiye) + Claude (Sonnet)
- **Vector DB:** Pinecone (RAG)
- **File Storage:** CloudFlare R2
- **Notifications:** FCM, NetGSM, SendGrid, WhatsApp, Telegram

### 2.2 Modül Yapısı (21 Modül)

| Modül | Açıklama |
|-------|----------|
| auth | JWT + OTP kimlik doğrulama |
| users | Kullanıcı CRUD, arama |
| cases | Dava dosyaları |
| hearings | Duruşmalar |
| notifications | Tebligatlar |
| delegations | Tevkil pazarı |
| documents | Belge üretimi (PDF/Word/UDF) |
| reminders | Hatırlatıcılar |
| ai | Minimax + Claude entegrasyonu |
| admin | Admin panel API'leri |
| uets | PTT UETS entegrasyonu |
| uyap | UYAP Chrome eklentisi backend |
| cron | Background jobs |
| rag | Pinecone RAG |
| files | R2 dosya yükleme |
| payments | iyzico/PayTR/Stripe |
| user-documents | Özlük dosyası |
| icra | İcra takibi |
| call-center | Borçlu arama |
| calendar | Birleşik takvim |

### 2.3 Veritabanı (23 Model)

Ana tablolar:
- User, Subscription, Case, Hearing
- Notification, Delegation, Complaint
- Document, DocumentEmbedding
- Reminder, AiConfig, UserToken
- UetsSession, AuditLog
- Payment, UserDocument
- IcraFile, IcraPayment, IcraCallRecord, IcraAssetHistory
- NotificationTemplate, NotificationLog

---

## 3. AI Mimarisi

### 3.1 Hibrit AI Sistemi
Admin panelden her görev için Minimax veya Claude seçilir.

### 3.2 AI Görevleri ve Modeller

| Görev | Varsayılan | Token Limiti |
|-------|-----------|--------------|
| notification_summary | MINIMAX | ❌ YOK (sınırsız - UETS) |
| deadline_extract | CLAUDE | ❌ YOK (sınırsız - UETS) |
| case_summary | MINIMAX | ✅ Var |
| decision_analysis | CLAUDE | ✅ Var |
| document_generate | MINIMAX | ✅ Var |
| document_revise | MINIMAX | ✅ Var |
| legal_notice | MINIMAX | ✅ Var |
| legal_research | CLAUDE | ✅ Var |
| general_qa | MINIMAX | ✅ Var |

### 3.3 RAG Sistemi
- Pinecone vektör veritabanı
- Belge chunking: 512-1024 token
- Anti-halüsinasyon: kaynak gösterme + "emin değilim" eşiği

---

## 4. Kritik İş Kuralları

### 4.1 Tevkil (Delegation)
- Ücretsiz (komisyon YOK - TBB kuralı)
- 24 saat içinde onaylanmazsa otomatik iptal
- Yük dengeleme: MAX_ACTIVE_DELEGATIONS = 5

### 4.2 UETS 5 Gün Kuralı
- Açılmamış tebligatlar 5. günde otomatik işlenir
- AI özet çıkarılır
- Hatırlatıcı oluşturulur

### 4.3 KVKK
- Minimax Türkiye: Veri Türkiye'de kalır
- Claude kullanımı: Açık rıza gerekli

### 4.4 AI İnsan Onayı
- document_generate: İnsan onayı zorunlu
- document_revise: İnsan onayı zorunlu
- legal_notice: İnsan onayı zorunlu

---

## 5. API Endpoint'leri

### 5.1 Auth
- POST /auth/register - Kayıt
- POST /auth/login - Giriş
- POST /auth/verify-otp - OTP doğrulama
- POST /auth/refresh - Token yenile

### 5.2 Cases
- GET /cases - Liste
- POST /cases - Oluştur
- GET /cases/:id - Detay
- PUT /cases/:id - Güncelle
- DELETE /cases/:id - Sil (soft delete)
- POST /cases/:id/hearings - Duruşma ekle
- PUT /cases/:id/hearings/:hid - Duruşma güncelle
- DELETE /cases/:id/hearings/:hid - Duruşma sil

### 5.3 Notifications
- GET /notifications - Liste
- PUT /notifications/:id/read - Okundu
- PUT /notifications/:id/star - Yıldızla
- POST /notifications/:id/reminder - Hatırlatıcı ekle
- POST /notifications/:id/link-case - Davaya ekle
- POST /notifications/send - Çoklu kanal bildirim

### 5.4 UETS
- POST /uets/connect - Bağlan
- POST /uets/sync - Tebligat çek
- GET /uets/status - Durum

### 5.5 Calendar
- GET /calendar/items - Takvim verileri
- GET /calendar/this-week - Bu hafta
- GET /calendar/this-month - Bu ay
- GET /calendar/today - Bugün
- GET /calendar/upcoming - Yaklaşanlar
- GET /calendar/overdue - Gecikmişler

### 5.6 AI
- POST /ai/summarize - Özetle
- POST /ai/deadline-extract - Süre çıkar
- POST /ai/case-summary - Dosya özeti
- POST /ai/document-generate - Dilekçe üret
- POST /ai/legal-research - İçtihat ara

### 5.7 Payments
- POST /payments/subscription - Abonelik ödemesi
- POST /payments/token-package - Token paketi
- GET /payments/history - Geçmiş

### 5.8 Icra
- POST /icra/track - Takip başlat
- POST /icra/bulk/xml - XML'den toplu
- POST /icra/files/:id/assets - Mal varlığı tespit

### 5.9 Call Center
- POST /call-center/calls - Arama kaydı
- GET /call-center/call-list - Aranacaklar
- GET /call-center/promises - Ödeme sözleri

### 5.10 Admin
- GET /admin/users - Kullanıcılar
- PUT /admin/ai-config/:task - AI config güncelle
- GET /admin/stats - İstatistikler

---

## 6. Bildirim Kanalları

| Kanal | Servis |
|-------|--------|
| Push | Firebase FCM |
| SMS | NetGSM |
| Email | SendGrid |
| WhatsApp | WhatsApp Business |
| Telegram | Telegram Bot API |

---

## 7. Dosya Yapısı

```
backend/
├── src/
│   ├── modules/
│   │   ├── {module}/
│   │   │   ├── {module}.module.ts
│   │   │   ├── {module}.service.ts
│   │   │   ├── {module}.controller.ts
│   │   │   └── services/
│   │   │       └── *.service.ts
│   │   └── ...
│   ├── prisma/
│   │   └── schema.prisma
│   ├── common/
│   │   ├── decorators/
│   │   └── filters/
│   └── app.module.ts
├── package.json
└── .env.example
```

---

## 8. Kod Standartları

### 8.1 TypeScript
- Use strict mode
- Explicit types (no `any`)
- Interface for DTOs

### 8.2 Naming
- Files: kebab-case
- Classes: PascalCase
- Functions: camelCase

### 8.3 Comments
- Tüm public method'lar Türkçe yorum
- Complex logic açıklanmalı

---

## 9. Environment Değişkenleri

### 9.1 Veritabanı
- DATABASE_URL

### 9.2 JWT
- JWT_SECRET
- JWT_EXPIRES_IN

### 9.3 AI
- MINIMAX_API_KEY
- MINIMAX_API_URL
- CLAUDE_API_KEY

### 9.4 Storage
- R2_ACCOUNT_ID
- R2_ACCESS_KEY
- R2_SECRET_KEY
- R2_BUCKET

### 9.5 Bildirim
- FCM_SERVER_KEY
- NETGSM_USER / PASS / ORIGINATOR
- SENDGRID_API_KEY
- TELEGRAM_BOT_TOKEN

### 9.6 Ödeme
- IYZICO_API_KEY / SECRET_KEY
- PAYTR_MERCHANT_ID / KEY / SALT
- STRIPE_SECRET_KEY

---

## 10. Test

### 10.1 Manuel Test Komutları

```bash
# Veritabanı migrate
npm run prisma:migrate

# Derleme kontrolü
npm run build

# Test
npm run test
```

### 10.2 API Test

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

---

## 11. Hata Çözümü

| Hata | Çözüm |
|------|-------|
| Module not found | Modülü app.module.ts'e import et |
| Prisma Client error | `npx prisma generate` çalıştır |
| Token expired | Login ol ve yeni token al |
| Rate limit | 60 sn bekle veya throttle ayarlarını kontrol et |

---

## 12. Commit Kuralları

### 12.1 Branch
- main - Production
- feature/* - Yeni özellik
- fix/* - Hata düzeltme
- docs/* - Dokümantasyon

### 12.2 Commit Message
```
[tür] Açıklama

Türler: feat, fix, docs, refactor, test, chore
```

---

*Son güncelleme: 02 Haziran 2026*  
*Craft Agent ile oluşturuldu*