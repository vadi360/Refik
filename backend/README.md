# AvukatPro Backend API

<div align="center">

**Versiyon:** 2.0  
**Tarih:** 02 Haziran 2026  
**GitHub:** https://github.com/vadi360/AvukatPro  
**API Docs:** https://api.avukatpro.com/api/docs

*Türkiye'nin Hukuk Asistanı - Backend API*

---

| Durum | Değer |
|-------|-------|
| Framework | NestJS 10 |
| Language | TypeScript 5.3 |
| Database | PostgreSQL + Prisma |
| API Style | REST + Swagger |
| Auth | JWT + OTP |

</div>

---

## 📋 İçindekiler

1. [Hakkında](#1-hakkında)
2. [Teknoloji Stack](#2-teknoloji-stack)
3. [Modüller](#3-modüller)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [API Endpoint'leri](#5-api-endpointleri)
6. [AI Mimarisi](#6-ai-mimarisi)
7. [Bildirim Sistemi](#7-bildirim-sistemi)
8. [Güvenlik](#8-güvenlik)
9. [Kurulum](#9-kurulum)
10. [Yapılandırma](#10-yapılandırma)
11. [Test](#11-test)
12. [Deploy](#12-deploy)

---

## 1. Hakkında

AvukatPro Backend, avukatların kullandığı mobil öncelikli yapay zekâ destekli hukuk asistanının API katmanıdır. Tevkil pazarı, UETS entegrasyonu, AI belge üretimi ve daha fazlasını sunar.

### Temel Özellikler

- **Kimlik Doğrulama** — JWT + OTP (telefon ile kayıt)
- **Dava Yönetimi** — CRUD, duruşma takibi
- **Tebligat Yönetimi** — UETS 5 gün kuralı otomasyonu
- **Tevkil Pazarı** — Avukatlar arası duruşma devri
- **AI Entegrasyonu** — Minimax + Claude hibrit sistem
- **RAG Sistemi** — Pinecone vektör veritabanı
- **Ödeme** — iyzico, PayTR, Stripe entegrasyonu
- **İcra Takibi** — Toplu takip, mal varlığı tespiti
- **Birleşik Takvim** — Tüm veri kaynaklarını birleştirir
- **Çoklu Kanal Bildirim** — Push, SMS, Email, WhatsApp, Telegram

---

## 2. Teknoloji Stack

### 2.1 Core

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Runtime | Node.js | 18+ |
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.3 |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 5.x |

### 2.2 Servisler

| Servis | Teknoloji |
|--------|-----------|
| Cache | Redis |
| AI (1) | Minimax M2.7 (Türkiye) |
| AI (2) | Claude Sonnet |
| Vector DB | Pinecone |
| Storage | CloudFlare R2 |
| Push | Firebase FCM |
| SMS | NetGSM |
| Email | SendGrid |
| WhatsApp | WhatsApp Business |
| Telegram | Telegram Bot API |
| Ödeme | iyzico / PayTR / Stripe |

---

## 3. Modüller (21 Adet)

### 3.1 Auth Modülü

**Açıklama:** JWT + OTP kimlik doğrulama

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/register` | POST | Yeni avukat kaydı |
| `/auth/login` | POST | Email + şifre girişi |
| `/auth/logout` | POST | Çıkış |
| `/auth/refresh` | POST | Token yenile |
| `/auth/forgot-password` | POST | Şifre sıfırlama |
| `/auth/verify-otp` | POST | OTP doğrulama |
| `/auth/resend-otp` | POST | OTP yeniden gönder |

**DTO'lar:**
```typescript
// RegisterDto
{
  name: string;          // Ad soyad
  email: string;         // Email
  phone: string;         // Telefon (+90...)
  password: string;      // Şifre (min 8 karakter)
  baroId: string;        // Baro ID
  licenseNumber: string;  // Ruhsat no
  kvkkConsent: boolean;   // KVKK onayı
}

// LoginDto
{
  email: string;
  password: string;
}

// VerifyOtpDto
{
  phone: string;
  otp: string;          // 6 haneli kod
}
```

### 3.2 Users Modülü

**Açıklama:** Kullanıcı CRUD, profil yönetimi

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/users/profile` | GET | Profilim |
| `/users/profile` | PUT | Profil güncelle |
| `/users/avatar` | PUT | Avatar güncelle |
| `/users/password` | PUT | Şifre değiştir |
| `/users/search` | GET | Avukat ara |
| `/users/recommendations` | GET | Önerilen avukatlar |
| `/users/:id` | GET | Kullanıcı detay (public) |
| `/users/preferences` | PUT | Bildirim tercihleri |

### 3.3 Cases Modülü

**Açıklama:** Dava dosyaları, duruşmalar

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/cases` | GET | Dosyalarım (liste) |
| `/cases` | POST | Yeni dava oluştur |
| `/cases/:id` | GET | Dava detay |
| `/cases/:id` | PUT | Dava güncelle |
| `/cases/:id` | DELETE | Dava sil (soft delete) |
| `/cases/:id/hearings` | GET | Duruşmalar |
| `/cases/:id/hearings` | POST | Duruşma ekle |
| `/cases/:id/hearings/:hid` | PUT | Duruşma güncelle |
| `/cases/:id/hearings/:hid` | DELETE | Duruşma sil |
| `/cases/:id/link-notification/:nid` | POST | Tebligat bağla |

### 3.4 Notifications Modülü

**Açıklama:** Tebligatlar, UETS entegrasyonu

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/notifications` | GET | Tebligat listesi |
| `/notifications/:id` | GET | Tebligat detay |
| `/notifications/:id/read` | PUT | Okundu işaretle |
| `/notifications/:id/star` | PUT | Yıldızla |
| `/notifications/:id/reminder` | POST | Hatırlatıcı ekle |
| `/notifications/:id/link-case` | POST | Davaya bağla |
| `/notifications/auto-process` | GET | 5 gün kuralı listesi |
| `/notifications/unread-count` | GET | Okunmamış sayısı |

### 3.5 Delegations Modülü

**Açıklama:** Tevkil pazarı

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/delegations` | GET | Tevkillerim |
| `/delegations` | POST | Tevkil oluştur |
| `/delegations/:id` | GET | Tevkil detay |
| `/delegations/:id/accept` | PUT | Onayla |
| `/delegations/:id/reject` | PUT | Reddet |
| `/delegations/:id/cancel` | PUT | İptal et |
| `/delegations/:id/rate` | POST | Puanla (1-5) |
| `/delegations/:id/complain` | POST | Şikayet et |
| `/delegations/sent` | GET | Gönderilen tevkiller |
| `/delegations/received` | GET | Alınan tevkiller |

### 3.6 Documents Modülü

**Açıklama:** Belge üretimi (PDF, Word, UDF)

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/documents` | GET | Belgelerim |
| `/documents` | POST | Belge oluştur |
| `/documents/:id` | GET | Belge detay |
| `/documents/:id` | PUT | Belge güncelle |
| `/documents/:id` | DELETE | Belge sil |
| `/documents/:id/download` | GET | İndir (PDF/Word/UDF) |
| `/documents/:id/approve` | PUT | İnsan onayı |

### 3.7 AI Modülü

**Açıklama:** Minimax + Claude entegrasyonu

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/ai/summarize` | POST | Tebligat/dosya özetle |
| `/ai/deadline-extract` | POST | Süre çıkarımı |
| `/ai/case-summary` | POST | Dosya özeti (RAG) |
| `/ai/document-generate` | POST | Dilekçe üret |
| `/ai/document-revise` | POST | Dilekçe revizyon |
| `/ai/legal-research` | POST | İçtihat araştırması |
| `/ai/legal-notice` | POST | İhtarname üretimi |
| `/ai/analyze-decision` | POST | Karar analizi |
| `/ai/chat` | POST | Genel Q&A |
| `/ai/config` | GET | AI görev yapılandırması |
| `/ai/token-usage` | GET | Token kullanımı |

### 3.8 Admin Modülü

**Açıklama:** Yönetici işlemleri

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/admin/users` | GET | Tüm kullanıcılar |
| `/admin/users/:id` | PUT | Kullanıcı güncelle/ban |
| `/admin/users/:id/approve` | PUT | Baro onayı |
| `/admin/packages` | GET | Paketler |
| `/admin/packages/:id` | PUT | Paket güncelle |
| `/admin/ai-config` | GET | AI görevleri |
| `/admin/ai-config/:task` | PUT | AI model seçimi |
| `/admin/stats` | GET | İstatistikler |
| `/admin/complaints` | GET | Şikayetler |
| `/admin/complaints/:id` | PUT | Şikayet kararı |
| `/admin/broadcast` | POST | Toplu bildirim |

### 3.9 UETS Modülü

**Açıklama:** PTT UETS entegrasyonu

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/uets/connect` | POST | UETS oturumu başlat |
| `/uets/disconnect` | DELETE | Oturumu kapat |
| `/uets/status` | GET | Bağlantı durumu |
| `/uets/sync` | POST | Tebligatları çek |
| `/uets/manual-sync` | POST | Manuel senkron |
| `/uets/auto-process` | GET | 5 gün kuralı listesi |
| `/uets/process/:id` | POST | Tek tebligat işle |

### 3.10 RAG Modülü

**Açıklama:** Pinecone RAG sistemi

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/rag/index/:documentId` | POST | Belge indeksle |
| `/rag/index/:documentId` | DELETE | Belgeyi sil |
| `/rag/search` | GET | Arama (similarity) |
| `/rag/context` | GET | AI için context hazırla |
| `/rag/stats` | GET | RAG istatistikleri |

### 3.11 Payments Modülü

**Açıklama:** Ödeme entegrasyonları

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/payments/subscription` | POST | Abonelik ödemesi |
| `/payments/token-package` | POST | Token paketi satın al |
| `/payments/cancel` | POST | Abonelik iptal |
| `/payments/history` | GET | Ödeme geçmişi |
| `/payments/webhook/iyzico` | POST | iyzico webhook |
| `/payments/webhook/paytr` | POST | PayTR webhook |
| `/payments/webhook/stripe` | POST | Stripe webhook |

### 3.12 Icra Modülü

**Açıklama:** İcra takibi

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/icra/track` | POST | Takip başlat |
| `/icra/files` | GET | İcra dosyaları |
| `/icra/files/:id` | GET | Dosya detay |
| `/icra/files/:id` | DELETE | Dosya sil |
| `/icra/files/:id/payments` | GET | Ödemeler |
| `/icra/files/:id/payments` | POST | Ödeme ekle |
| `/icra/files/:id/assets` | POST | Mal varlığı tespiti (AI) |
| `/icra/bulk/xml` | POST | XML'den toplu aktarım |

### 3.13 Call Center Modülü

**Açıklama:** Borçlu arama takibi

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/call-center/calls` | GET | Arama kayıtları |
| `/call-center/calls` | POST | Yeni arama kaydı |
| `/call-center/calls/:id` | PUT | Arama güncelle |
| `/call-center/call-list` | GET | Aranacaklar listesi |
| `/call-center/promises` | GET | Ödeme sözleri |
| `/call-center/promises/:id` | PUT | Söz güncelle |

### 3.14 Calendar Modülü

**Açıklama:** Birleşik takvim

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/calendar/items` | GET | Tüm takvim verileri |
| `/calendar/items` | GET | Tarih aralığı (query) |
| `/calendar/stats` | GET | İstatistikler |
| `/calendar/items/:type/:id` | PUT | Takvim item güncelle |
| `/calendar/items/:type/:id` | DELETE | Takvim item sil |
| `/calendar/this-week` | GET | Bu hafta |
| `/calendar/this-month` | GET | Bu ay |
| `/calendar/today` | GET | Bugünkü özet |
| `/calendar/upcoming` | GET | Önümüzdeki 7 gün |
| `/calendar/overdue` | GET | Gecikmişler |

---

## 4. Veritabanı Şeması (23 Model)

### 4.1 Kullanıcı Modelleri

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  passwordHash    String
  name            String
  phone           String   @unique
  role            UserRole @default(LAWYER)
  
  // Baro
  baroId          String?
  licenseNumber   String?
  isBaroVerified  Boolean  @default(false)
  approvalStatus  ApprovalStatus @default(PENDING)
  
  // Değerlendirme
  rating          Float    @default(0)
  ratingCount     Int      @default(0)
  
  // KVKK
  kvkkConsent     Boolean  @default(false)
  kvkkConsentAt   DateTime?
  
  // Bildirim
  pushToken       String?
  telegramId      String?
  notificationPreferences Json?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
  
  // Relations
  subscription    Subscription?
  cases           Case[]
  notifications   Notification[]
  delegationsSent Delegation[] @relation("FromUser")
  delegationsReceived Delegation[] @relation("ToUser")
  documents       Document[]
  reminders       Reminder[]
  userTokens      UserToken[]
  uetsSessions    UetsSession[]
  auditLogs       AuditLog[]
  userDocuments   UserDocument[]
  icraFiles       IcraFile[]
  icraPayments    IcraPayment[]
  icraCallRecords IcraCallRecord[]
  notificationsLog NotificationLog[]
}
```

### 4.2 Abonelik Modeli

```prisma
model Subscription {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  packageType     SubscriptionPackage @default(BASIC)
  tokenLimit      Int
  tokensUsed      Int      @default(0)
  
  isActive        Boolean  @default(true)
  startDate       DateTime
  endDate         DateTime
  
  // Ödeme
  paymentId       String?
  paymentProvider PaymentProvider?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 4.3 Dava Modeli

```prisma
model Case {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  caseNumber      String
  court           String?
  caseType        String?
  subject         String?
  status          CaseStatus @default(ACTIVE)
  
  // Taraflar (JSON)
  parties         Json?
  
  // AI özet
  aiSummary       String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
  
  // Relations
  hearings        Hearing[]
  notifications   Notification[]
  delegations     Delegation[]
  documents       Document[]
  reminders       Reminder[]
  documentEmbeddings DocumentEmbedding[]
  icraFiles       IcraFile[]
}
```

### 4.4 Bildirim Modeli

```prisma
model Notification {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  caseId          String?
  case            Case?    @relation(fields: [caseId], references: [id])
  
  type            NotificationType
  title           String
  content         String?
  
  // UETS
  uetsId          String?
  uetsRead        Boolean  @default(false)
  uetsReadAt      DateTime?
  uetsAutoProcessAt DateTime?  // 5 gün kuralı
  
  // AI analiz
  aiSummary       String?
  aiDeadline      DateTime?
  
  // Durum
  isStarred       Boolean  @default(false)
  isRead          Boolean  @default(false)
  readAt          DateTime?
  
  // Meta
  metadata        Json?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
}
```

### 4.5 Tevkil Modeli

```prisma
model Delegation {
  id              String   @id @default(uuid())
  
  fromUserId      String
  fromUser        User     @relation("FromUser", fields: [fromUserId], references: [id])
  
  toUserId        String?
  toUser          User?    @relation("ToUser", fields: [toUserId], references: [id])
  
  caseId          String
  case            Case     @relation(fields: [caseId], references: [id])
  
  type            DelegationType
  status          DelegationStatus @default(PENDING)
  
  // Konum
  courtLocation   String?
  
  // Değerlendirme
  rating          Int?
  ratingComment   String?
  ratedAt         DateTime?
  
  // Şikayet
  complaintId     String?
  complaint       Complaint? @relation(fields: [complaintId], references: [id])
  
  // Yük dengeleme
  toUserDelegationCount Int @default(0)
  
  // Not
  note            String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
  
  expiresAt       DateTime  // 24 saat sonra iptal
}
```

### 4.6 AI Yapılandırma Modeli

```prisma
model AiConfig {
  id              String   @id @default(uuid())
  
  taskName        String   @unique  // notification_summary, deadline_extract, vb.
  displayName     String
  model           AiModel  // MINIMAX veya CLAUDE
  description     String?
  isActive        Boolean  @default(true)
  priority        Int      @default(0)
  
  settings        Json?    // Temperature, maxTokens, vb.
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 4.7 Token Kullanım Modeli

```prisma
model UserToken {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  tokenAmount     Int
  aiModel         AiModel
  taskType        String
  
  periodStart     DateTime
  periodEnd       DateTime
  
  createdAt       DateTime @default(now())
}
```

### 4.8 Tam Şema Listesi

| Model | Açıklama |
|-------|----------|
| `User` | Avukat kullanıcılar |
| `Subscription` | Abonelik paketleri |
| `Case` | Dava dosyaları |
| `Hearing` | Duruşmalar |
| `Notification` | Tebligatlar |
| `Delegation` | Tevkiller |
| `Complaint` | Şikayetler |
| `Document` | Belgeler |
| `DocumentEmbedding` | RAG embeddings |
| `Reminder` | Hatırlatıcılar |
| `AiConfig` | AI görev yapılandırma |
| `AiConfigUpdate` | AI config değişiklik log |
| `UserToken` | Token kullanımı |
| `UetsSession` | UETS oturumları |
| `AuditLog` | Denetim kayıtları |
| `Payment` | Ödemeler |
| `UserDocument` | Özlük dosyası |
| `IcraFile` | İcra dosyaları |
| `IcraPayment` | İcra ödemeleri |
| `IcraCallRecord` | Arama kayıtları |
| `IcraAssetHistory` | Mal varlığı geçmişi |
| `NotificationTemplate` | Bildirim şablonları |
| `NotificationLog` | Bildirim logları |

---

## 5. API Endpoint'leri

### 5.1 Toplam Endpoint Sayısı

| Modül | Sayı |
|-------|------|
| Auth | ~10 |
| Users | ~8 |
| Cases | ~10 |
| Notifications | ~10 |
| Delegations | ~10 |
| Documents | ~6 |
| AI | ~12 |
| Admin | ~15 |
| UETS | ~7 |
| UYAP | ~5 |
| RAG | ~5 |
| Payments | ~8 |
| Icra | ~10 |
| Call Center | ~6 |
| Calendar | ~10 |
| Files | ~5 |
| Health | ~2 |
| **Toplam** | **~140+** |

### 5.2 API Versiyonlama

```
Base URL: /api/v1

Örnek:
- POST /api/v1/auth/login
- GET /api/v1/cases
- POST /api/v1/ai/summarize
```

### 5.3 Swagger Dokümantasyonu

```
http://localhost:3000/api/docs
```

---

## 6. AI Mimarisi

### 6.1 Hibrit AI Sistemi

```
┌─────────────────────────────────────────────────────────────┐
│                    HİBRİT AI SİSTEMİ                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin Panel → /admin/ai-config/:task → Model seçimi       │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  AI Görevleri ve Yapılandırma                      │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  Görev                  │ Model    │ Token Limit  │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  notification_summary   │ MINIMAX  │ YOK (sınırsız)│     │
│  │  deadline_extract        │ CLAUDE   │ YOK (sınırsız)│     │
│  │  case_summary            │ MINIMAX  │ VAR          │     │
│  │  decision_analysis       │ CLAUDE   │ VAR          │     │
│  │  document_generate       │ MINIMAX  │ VAR          │     │
│  │  document_revise         │ MINIMAX  │ VAR          │     │
│  │  legal_notice            │ MINIMAX  │ VAR          │     │
│  │  legal_research          │ CLAUDE   │ VAR          │     │
│  │  general_qa              │ MINIMAX  │ VAR          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  UETS Görevleri (token limit YOK):                         │
│  - notification_summary: Tebligat özetleme                  │
│  - deadline_extract: Süre çıkarımı                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Token Takibi

```typescript
// AI Service - Token limit kontrolü
async checkTokenLimit(userId: string, additionalTokens: number) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, isActive: true }
  });
  
  const usedTokens = await prisma.userToken.aggregate({
    where: { userId, periodStart: thisMonth, periodEnd: thisMonth },
    _sum: { tokenAmount: true }
  });
  
  if (usedTokens + additionalTokens > subscription.tokenLimit) {
    throw new ForbiddenException('Token limit aşıldı');
  }
}

// Token kaydet
await prisma.userToken.create({
  data: { userId, tokenAmount, aiModel, taskType }
});
```

### 6.3 RAG Akışı

```
1. Belge yükle → chunk (512-1024 token)
2. Embedding üret (Minimax)
3. Pinecone'a kaydet
4. Sorgu → Pinecone similarity search
5. En yakın belgeleri AI'a context olarak ver
6. AI yanıt üretir → kaynak gösterir
```

---

## 7. Bildirim Sistemi

### 7.1 Desteklenen Kanallar

| Kanal | Servis | Durum |
|-------|--------|-------|
| Push | Firebase FCM | ✅ |
| SMS | NetGSM | ✅ |
| Email | SendGrid | ✅ |
| WhatsApp | WhatsApp Business | ✅ |
| Telegram | Telegram Bot API | ✅ |

### 7.2 Çoklu Kanal Bildirim Servisi

```typescript
// notification.service.ts
interface SendNotificationOptions {
  userId: string;
  title: string;
  body: string;
  channels: ('push' | 'sms' | 'email' | 'whatsapp' | 'telegram')[];
  data?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}
```

### 7.3 Bildirim Şablonları

```typescript
interface NotificationTemplate {
  id: string;
  name: string;
  titleTemplate: string;
  bodyTemplate: string;
  channels: Channel[];
  variables: string[];
}
```

---

## 8. Güvenlik

### 8.1 Kimlik Doğrulama

- JWT Access token (1 saat geçerli)
- JWT Refresh token (7 gün geçerli)
- bcrypt şifre hashleme (12 round)
- OTP 6 haneli (5 dk geçerli)

### 8.2 Yetkilendirme

```typescript
// Rollere göre erişim
enum UserRole {
  LAWYER      // Avukat - kendi verileri
  OFFICE_ADMIN // Büro yöneticisi - ekip verileri
  ADMIN       // Admin - tüm veriler
}
```

### 8.3 Rate Limiting

- 100 istek/dakika (varsayılan)
- Auth endpoints: 10 istek/dakika
- AI endpoints: 20 istek/dakika

### 8.4 KVKK

- Minimax Türkiye sunucusu (veri Türkiye'de kalır)
- Claude için açık rıza gerekliliği
- Veri silme hakkı (`/users/profile` DELETE)

---

## 9. Kurulum

### 9.1 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm veya yarn

### 9.2 Adımlar

```bash
# 1. Projeyi klonlayın
git clone https://github.com/vadi360/AvukatPro.git
cd AvukatPro/backend

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment dosyasını oluşturun
cp .env.example .env
# .env dosyasını düzenleyin

# 4. Veritabanı migration çalıştırın
npm run prisma:migrate

# 5. (Opsiyonel) Tohum verileri
npm run prisma:seed

# 6. Geliştirme sunucusu başlatın
npm run start:dev
```

### 9.3 API'ye Erişim

```
http://localhost:3000           # Ana URL
http://localhost:3000/api/docs  # Swagger UI
http://localhost:3000/health    # Health check
```

---

## 10. Yapılandırma

### 10.1 Environment Değişkenleri

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `NODE_ENV` | Uygulama modu | `development` |
| `PORT` | API portu | `3000` |
| `DATABASE_URL` | PostgreSQL | `postgresql://...` |
| `REDIS_URL` | Redis | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | `openssl rand -base64 64` |
| `MINIMAX_API_KEY` | Minimax API | Platform.minimax.io |
| `CLAUDE_API_KEY` | Claude API | console.anthropic.com |
| `PINECONE_API_KEY` | Pinecone | pinecone.io |
| `R2_*` | CloudFlare R2 | CloudFlare dashboard |
| `NETGSM_*` | NetGSM SMS | netgsm.com.tr |
| `SENDGRID_API_KEY` | SendGrid | sendgrid.com |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot | @BotFather |
| `IYIZICO_*` | iyzico | iyzico.com |
| `PAYTR_*` | PayTR | paytr.com |
| `STRIPE_SECRET_KEY` | Stripe | stripe.com |

### 10.2 .env.example

```bash
# Detaylı environment şablonu için backend/.env.example dosyasına bakın
```

---

## 11. Test

### 11.1 Komutlar

```bash
# Unit test
npm test

# Test coverage
npm run test:cov

# E2E test
npm run test:e2e

# TypeScript check
npm run build
```

### 11.2 API Test

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

---

## 12. Deploy

### 12.1 Docker

```bash
# Build
docker build -t avocatpro-backend .

# Run
docker run -p 3000:3000 \
  --env-file .env \
  avocatpro-backend
```

### 12.2 PM2

```bash
# Build
npm run build

# Production'da çalıştır
pm2 start dist/main.js --name avocatpro-backend

# Monitor
pm2 monit
```

### 12.3 Environment (Production)

```bash
# Production'da güvenli secret yönetimi kullanın
# AWS Secrets Manager, HashiCorp Vault, vb.
```

---

<div align="center">

*AvukatPro Backend API*

*© 2026 AvukatPro. Tüm hakları saklıdır.*

</div>