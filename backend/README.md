# AvukatPro Backend

<div align="center">

**Versiyon:** 2.0 | **Tarih:** 02 Haziran 2026  
**GitHub:** https://github.com/vadi360/AvukatPro
**Commit:** b76d796

*Mobil öncelikli, AI destekli, tevkil pazar yeri*

| Durum | Değer |
|-------|-------|
| Modül | 21 |
| Prisma Model | 23 |
| Controller | 16 |
| API Endpoint | ~90+ |
| Toplam Satır | ~15,000+ |

</div>

</div>

---

## 📋 İçindekiler

- [Hakkında](#hakkında)
- [Özellikler](#özellikler)
- [Teknoloji Stack](#teknoloji-stack)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [API Kullanımı](#api-kullanımı)
- [Veritabanı Şeması](#veritabanı-şeması)
- [Modüller](#modüller)
- [AI Mimarisi](#ai-mimarisi)
- [Güvenlik](#güvenlik)
- [Deploy](#deploy)
- [Test](#test)
- [Katıiım](#katkı)

---

## 🔰 Hakkında

AvukatPro, Türkiye'deki avukatlara yönelik, mobil öncelikli yapay zekâ destekli bir hukuk asistanı ve tevkil pazar yeridir.

### Temel Özellikler

1. **Tevkil Pazar Yeri** - Avukatlar arası otomatik eşleştirme ile duruşma/işlem takibi
2. **UETS Entegrasyonu** - PTT UETS'ten tebligat çekme ve AI ile analiz
3. **UYAP Dosya Özetleme** - Tarayıcı eklentisi ile UYAP'tan dosya çekme ve RAG tabanlı özetleme
4. **Otomatik Belge Üretimi** - AI ile dilekçe, ihtarname, içtihat araştırması

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama & Yetkilendirme
- JWT tabanlı kimlik doğrulama (Access + Refresh token)
- OTP ile telefon doğrulama
- Rol tabanlı erişim kontrolü (Avukat, Büro Yöneticisi, Admin)
- KVKK açık rıza yönetimi

### 📁 Dosya Yönetimi
- Dava dosyası CRUD işlemleri
- Duruşma takibi
- Tebligat yönetimi (5 gün kuralı otomasyonu)
- Belge üretimi (PDF, Word, UDF formatları)

### 🤖 Yapay Zeka Entegrasyonu
- **Hibrit AI Mimarisi** - Minimax ve Claude arasında Admin seçimi
- RAG tabanlı içtihat araştırması (Pinecone vektör DB)
- AI özetleme ve analiz
- Anti-halüsinasyon güvencesi

### 📨 Bildirim Sistemi
- Push bildirimleri (Firebase FCM)
- SMS bildirimleri (NetGSM)
- E-posta bildirimleri (SendGrid)
- WhatsApp Business API

### 📊 Tevkil Pazar Yeri
- Yük dengeleme algoritması
- Puanlama ve şikayet sistemi
- Otomatik avukat eşleştirme

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | NestJS 10 | Backend framework |
| **Language** | TypeScript 5.3 | Tip güvenli programlama |
| **Database** | PostgreSQL | Ana veritabanı |
| **ORM** | Prisma 5 | Veritabanı erişimi |
| **Cache** | Redis | Session ve cache |
| **Auth** | JWT + Passport | Kimlik doğrulama |
| **API Docs** | Swagger/OpenAPI | API dokümantasyonu |
| **AI 1** | Minimax M2.7 | Türkiye KVKK uyumlu |
| **AI 2** | Claude Sonnet | Yüksek doğruluk |
| **Vektör DB** | Pinecone | RAG sistemi |
| **Storage** | CloudFlare R2 | Dosya depolama |
| **SMS** | NetGSM | SMS bildirimleri |
| **Email** | SendGrid | E-posta gönderimi |
| **Push** | Firebase FCM | Push bildirimleri |

---

## 📂 Proje Yapısı

```
backend/
├── src/
│   ├── main.ts                         # Uygulama giriş noktası
│   ├── app.module.ts                   # Ana modül
│   │
│   ├── config/                        # Yapılandırma dosyaları
│   │
│   ├── common/                        # Paylaşılan bileşenler
│   │   ├── decorators/                 # Özel decorator'lar (@Public, @CurrentUser)
│   │   ├── filters/                   # Exception filtreleri (HttpExceptionFilter)
│   │   ├── guards/                    # Guard'lar (JwtAuthGuard, RolesGuard)
│   │   ├── interceptors/              # Interceptor'lar (logging, transform)
│   │   └── pipes/                    # Validation pipe'lar
│   │
│   └── modules/                       # Feature modülleri
│       ├── auth/                      # Kimlik doğrulama
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts     # /api/v1/auth/*
│       │   ├── auth.service.ts       # Register, login, refresh, logout
│       │   ├── dto/                   # Data Transfer Objects
│       │   │   ├── auth.dto.ts
│       │   │   ├── register.dto.ts
│       │   │   ├── login.dto.ts
│       │   │   └── ...
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── local.strategy.ts
│       │   └── guards/
│       │       └── jwt-auth.guard.ts
│       │
│       ├── users/                     # Kullanıcı işlemleri
│       │   ├── users.module.ts
│       │   ├── users.controller.ts   # /api/v1/users/*
│       │   ├── users.service.ts       # Profil, şifre, avatar
│       │   └── dto/
│       │
│       ├── cases/                     # Dava dosyaları
│       │   ├── cases.module.ts
│       │   ├── cases.controller.ts     # /api/v1/cases/*
│       │   ├── cases.service.ts       # CRUD, duruşmalar
│       │   └── dto/
│       │
│       ├── notifications/             # Tebligatlar
│       │   ├── notifications.module.ts
│       │   ├── notifications.controller.ts
│       │   ├── notifications.service.ts # 5 gün kuralı, AI analizi
│       │   ├── dto/
│       │   └── services/              # Bildirim servisleri
│       │       ├── fcm.service.ts     # Firebase Push
│       │       ├── netgsm.service.ts  # SMS
│       │       ├── sendgrid.service.ts # Email
│       │       └── whatsapp.service.ts # WhatsApp
│       │
│       ├── delegations/              # Tevkiller
│       │   ├── delegations.module.ts
│       │   ├── delegations.controller.ts
│       │   ├── delegations.service.ts # Yük dengeleme, şikayet
│       │   └── dto/
│       │
│       ├── documents/                # Belgeler
│       │   ├── documents.module.ts
│       │   ├── documents.controller.ts
│       │   ├── documents.service.ts
│       │   ├── dto/
│       │   └── services/
│       │       └── document-generator.service.ts # PDF, Word, UDF
│       │
│       ├── reminders/                # Hatırlatıcılar
│       │   ├── reminders.module.ts
│       │   ├── reminders.controller.ts
│       │   ├── reminders.service.ts
│       │   └── dto/
│       │
│       ├── ai/                       # Yapay Zeka
│       │   ├── ai.module.ts
│       │   ├── ai.controller.ts      # /api/v1/ai/*
│       │   ├── ai.service.ts          # AI routing, token limit
│       │   └── providers/
│       │       ├── minimax.provider.ts
│       │       └── claude.provider.ts
│       │
│       ├── rag/                      # RAG (Retrieval Augmented Generation)
│       │   ├── rag.module.ts
│       │   ├── rag.controller.ts      # /api/v1/rag/*
│       │   └── services/
│       │       └── rag.service.ts     # Pinecone, embedding, search
│       │
│       ├── admin/                    # Yönetici işlemleri
│       │   ├── admin.module.ts
│       │   ├── admin.controller.ts
│       │   ├── admin.service.ts
│       │   └── dto/
│       │
│       ├── uets/                     # UETS entegrasyonu
│       │   ├── uets.module.ts
│       │   ├── uets.controller.ts
│       │   ├── uets.service.ts
│       │   └── dto/
│       │
│       ├── files/                    # Dosya işlemleri (R2)
│       │   ├── files.module.ts
│       │   ├── files.controller.ts
│       │   ├── files.service.ts
│       │   └── dto/
│       │
│       ├── health/                   # Sağlık kontrolü
│       │   ├── health.module.ts
│       │   └── health.controller.ts  # /health, /health/db
│       │
│       └── prisma/                   # Veritabanı modülü
│           ├── prisma.module.ts
│           ├── prisma.service.ts
│           └── schema.prisma          # Veritabanı şeması
│
├── prisma/                            # Prisma dosyaları
│   ├── schema.prisma                 # Veritabanı şeması (src/prisma/schema.prisma'ye link)
│   └── seed.ts                       # Tohum verileri
│
├── test/                              # Test dosyaları
│   ├── auth.e2e-spec.ts
│   └── ...
│
├── .env.example                      # Environment şablonu
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md                         # (bu dosya)
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm veya yarn

### Adımlar

```bash
# 1. Projeyi klonlayın
git clone https://github.com/vadi360/AvukatPro.git
cd AvukatPro/backend

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment dosyasını oluşturun
cp .env.example .env
# .env dosyasını düzenleyerek gerçek değerleri girin

# 4. Veritabanı migration çalıştırın
npm run prisma:migrate

# 5. (Opsiyonel) Tohum verilerini yükleyin
npm run prisma:seed

# 6. Geliştirme sunucusunu başlatın
npm run start:dev
```

Sunucu `http://localhost:3000` adresinde çalışır.

---

## ⚙️ Yapılandırma

### Environment Değişkenleri

```bash
# .env dosyası oluşturun ve aşağıdaki değişkenleri doldurun:

# Veritabanı
DATABASE_URL=postgresql://postgres:password@localhost:5432/avukatpro

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# AI API'leri
MINIMAX_API_KEY=your-minimax-api-key
CLAUDE_API_KEY=your-claude-api-key

# CloudFlare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET=avukatpro-documents
R2_PUBLIC_URL=https://pub-xxx.r2.dev/avukatpro-documents

# Pinecone (RAG için)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=avukatpro-documents

# SMS (NetGSM)
NETGSM_USER=your-username
NETGSM_PASS=your-password
NETGSM_ORGINATOR=AVUKATPRO

# Email (SendGrid)
SENDGRID_API_KEY=SG.your-api-key
SENDGRID_FROM_EMAIL=noreply@avukatpro.com

# Firebase (Push)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Environment Değişkenleri Detaylı Açıklama

| Değişken | Açıklama | Örnek Değer |
|---------|----------|-------------|
| `NODE_ENV` | Uygulama modu | `development` / `production` |
| `PORT` | API portu | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 64` |
| `JWT_EXPIRES_IN` | Access token süresi | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token süresi | `7d` |
| `MINIMAX_API_KEY` | Minimax API anahtarı | Platform.minimax.io |
| `CLAUDE_API_KEY` | Claude API anahtarı | console.anthropic.com |
| `R2_*` | CloudFlare R2 credentials | CloudFlare dashboard |
| `PINECONE_*` | Pinecone vektör DB credentials | pinecone.io |
| `NETGSM_*` | NetGSM SMS credentials | netgsm.com.tr |
| `SENDGRID_*` | SendGrid email credentials | sendgrid.com |

---

## 📡 API Kullanımı

### Base URL

```
http://localhost:3000/api/v1
```

### API Dokümantasyonu

Swagger UI: `http://localhost:3000/api/docs`

### Kimlik Doğrulama

API'ye erişmek için `Authorization: Bearer <accessToken>` header'ı gereklidir.

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"avukat@example.com","password":"sifre123"}'

# Yanıt
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Ana Endpoint'ler

| Modül | Endpoint | Açıklama |
|-------|----------|----------|
| **Auth** | POST /auth/register | Yeni kayıt |
| | POST /auth/login | Giriş |
| | POST /auth/refresh | Token yenile |
| | POST /auth/forgot-password | Şifre sıfırla |
| **Users** | GET /users/profile | Profilim |
| | PUT /users/profile | Profil güncelle |
| | GET /users/search | Avukat ara |
| **Cases** | GET /cases | Dosyalarım |
| | POST /cases | Yeni dosya |
| | GET /cases/:id | Dosya detay |
| | GET /cases/:id/hearings | Duruşmalar |
| **Notifications** | GET /notifications | Tebligatlar |
| | PUT /notifications/:id/read | Okundu işaretle |
| | GET /notifications/auto-process | 5 gün kuralı |
| **Delegations** | POST /delegations | Tevkil oluştur |
| | PUT /delegations/:id/approve | Onayla |
| | POST /delegations/:id/rate | Puanla |
| **Documents** | POST /documents | Belge oluştur |
| | POST /documents/:id/download | İndir |
| **AI** | POST /ai/summarize | Özetle |
| | POST /ai/deadline-extract | Süre çıkar |
| | POST /ai/document-generate | Dilekçe üret |
| | POST /ai/legal-research | İçtihat ara |
| **RAG** | POST /rag/index/:id | Belge indeksle |
| | GET /rag/search | RAG araması |
| **Admin** | GET /admin/users | Tüm kullanıcılar |
| | PUT /admin/ai-config/:task | AI yapılandır |
| | GET /admin/stats | İstatistikler |

---

## 🗄️ Veritabanı Şeması

### Tablolar

```
┌─────────────────────────────────────────────────────────────┐
│                      VERİTABANI ŞEMASI                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  users ──────────── subscriptions (1:N)                    │
│    │                    └── tokenLimit, tokensUsed           │
│    │                                                       │
│    ├── cases ─────────── hearings (1:N)                    │
│    │    │                      └── hearingDate, status       │
│    │    │                                                       │
│    │    ├── notifications (1:N)                              │
│    │    │    └── deadline, uetsRead, aiSummary            │
│    │    │                                                       │
│    │    ├── delegations ─────────── complaints (1:N)       │
│    │    │    └── fromUser, toUser, status, rating          │
│    │    │                                                       │
│    │    ├── documents ──────── document_embeddings (1:N)     │
│    │    │    └── content, fileUrl, status, embedded        │
│    │    │                                                       │
│    │    └── reminders (1:N)                                   │
│    │         └── dueDate, notifyTypes, status              │
│    │                                                       │
│    ├── user_tokens (1:N)                                    │
│    │    └── tokenAmount, aiModel, taskType                  │
│    │                                                       │
│    ├── uets_sessions (1:N)                                  │
│    │    └── encryptedCredentials, lastSyncAt                 │
│    │                                                       │
│    ├── ai_config (1:N)                                      │
│    │    └── taskName, model, isActive, settings            │
│    │                                                       │
│    └── audit_logs (1:N)                                     │
│         └── action, entityType, oldValue, newValue          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tablo Detayları

| Tablo | Alanlar | Açıklama |
|-------|---------|----------|
| **users** | id, email, passwordHash, name, phone, role, rating, kvkkConsent, pushToken | Avukat kullanıcılar |
| **subscriptions** | id, userId, packageType, tokenLimit, tokensUsed, isActive | Abonelik paketleri |
| **cases** | id, userId, caseNumber, court, parties, status, aiSummary | Dava dosyaları |
| **hearings** | id, caseId, hearingDate, status, result | Duruşmalar |
| **notifications** | id, userId, caseId, type, title, deadline, uetsRead, uetsAutoProcessAt | Tebligatlar |
| **delegations** | id, fromUserId, toUserId, caseId, status, rating, toUserDelegationCount | Tevkiller |
| **documents** | id, userId, caseId, type, title, content, embedded, requiresApproval | Belgeler |
| **document_embeddings** | id, documentId, caseId, vectorId, chunkText, dimensions | RAG embedding'leri |
| **reminders** | id, userId, caseId, notificationId, type, dueDate, notifyTypes, status | Hatırlatıcılar |
| **ai_config** | id, taskName, model, isActive, settings | AI görev yapılandırması |
| **user_tokens** | id, userId, tokenAmount, aiModel, taskType, periodStart | Token kullanımı |
| **uets_sessions** | id, userId, encryptedCredentials, lastSyncAt, isActive | UETS oturumları |
| **audit_logs** | id, userId, action, entityType, entityId, oldValue, newValue | Denetim kayıtları |
| **complaints** | id, delegationId, filedById, againstId, reason, status | Şikayetler |

---

## 📦 Modüller

### Auth Modülü

Kimlik doğrulama işlemlerini yönetir.

**Controller:** `/api/v1/auth`

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/register` | POST | Yeni avukat kaydı |
| `/login` | POST | Giriş (email + şifre) |
| `/logout` | POST | Çıkış |
| `/refresh` | POST | Access token yenile |
| `/forgot-password` | POST | Şifre sıfırlama talebi |
| `/verify-otp` | POST | OTP doğrulama |

**DTO'lar:**
```typescript
RegisterDto { name, email, phone, password, kvkkConsent }
LoginDto { email, password }
ForgotPasswordDto { email }
VerifyOtpDto { phone, otp }
ResetPasswordDto { token, newPassword }
```

### AI Modülü

AI işlemlerini ve yönlendirmeyi yönetir.

**Controller:** `/api/v1/ai`

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/summarize` | POST | Tebligat/dosya özetle |
| `/deadline-extract` | POST | Süre çıkarımı |
| `/case-summary` | POST | Dosya özeti (RAG) |
| `/document-generate` | POST | Dilekçe üret |
| `/document-revise` | POST | Dilekçe revizyon |
| `/legal-research` | POST | İçtihat araştırması |
| `/analyze-decision` | POST | Karar analizi |
| `/chat` | POST | Genel Q&A |

**AI Görev Yapılandırması:**

| Görev | Varsayılan Model | Kritik |
|-------|-----------------|--------|
| notification_summary | MINIMAX | Hayır |
| deadline_extract | CLAUDE | Evet |
| case_summary | MINIMAX | Hayır |
| decision_analysis | CLAUDE | Evet |
| document_generate | MINIMAX | Hayır |
| document_revise | MINIMAX | Hayır |
| legal_notice | MINIMAX | Hayır |
| legal_research | CLAUDE | Evet |
| general_qa | MINIMAX | Hayır |

### Notifications Modülü

Tebligat ve bildirim işlemlerini yönetir.

**Controller:** `/api/v1/notifications`

**Servisler:**
- `FcmService` - Push bildirimleri (Firebase)
- `NetgsmService` - SMS bildirimleri (NetGSM)
- `SendgridService` - E-posta bildirimleri (SendGrid)
- `WhatsAppService` - WhatsApp bildirimleri

### RAG Modülü

Retrieval Augmented Generation işlemlerini yönetir.

**Controller:** `/api/v1/rag`

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/index/:documentId` | POST | Belgeyi Pinecone'a indeksle |
| `/index/:documentId` | DELETE | Belgeyi indeksden sil |
| `/search` | GET | Benzer belgeleri ara |
| `/context` | GET | AI için context hazırla |
| `/stats` | GET | RAG istatistikleri |

---

## 🤖 AI Mimarisi

### Hibrit AI Sistemi

```
┌─────────────────────────────────────────────────────────────┐
│                    AI İSTEK AKIŞI                           │
│                                                             │
│  Client Request                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────┐                                            │
│  │  JwtAuthGuard │ → Token doğrulama                       │
│  └──────┬──────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │  AiService  │ → Görev tipini al                          │
│  │ process()   │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐   ┌─────────────────┐                       │
│  │ ai_config  │ → │ Admin'in seçimi │                       │
│  │   DB       │   │ MINIMAX/CLAUDE  │                       │
│  └──────┬─────┘   └─────────────────┘                       │
│         │                                                    │
│    ┌────┴────┐                                              │
│    ▼         ▼                                              │
│  ┌──────┐ ┌────────┐                                        │
│  │Mini  │ │ Claude │  → Provider seçimi                     │
│  │max   │ │        │                                        │
│  └──┬───┘ └───┬────┘                                        │
│     │         │                                             │
│     ▼         ▼                                             │
│  ┌─────────────────────┐                                    │
│  │   AI API Call      │                                    │
│  │   + Token Tracking │                                    │
│  └─────────────────────┘                                    │
│         │                                                  │
│         ▼                                                  │
│  ┌─────────────────────┐                                    │
│  │  Response Format   │                                    │
│  │ { result, tokens, │                                    │
│  │  confidence, meta } │                                    │
│  └─────────────────────┘                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### RAG Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                       RAG AKIŞI                            │
│                                                             │
│  1. Belge yüklenir (UYAP veya manuel)                      │
│         ▼                                                   │
│  2. Chunking (parçalama) — 512-1024 token parçalar         │
│         ▼                                                   │
│  3. Embedding üretimi (Minimax embed model)               │
│         ▼                                                   │
│  4. Pinecone vektör veritabanına kaydet                   │
│         │                                                   │
│         ▼                                                   │
│  5. Sorgu gelir → Pinecone'de arama (similarity search)    │
│         │                                                   │
│         ▼                                                   │
│  6. En yakın belgeler çekilir (top-k)                      │
│         │                                                   │
│         ▼                                                   │
│  7. AI'a context olarak verilir + sorgu                    │
│         │                                                   │
│         ▼                                                   │
│  8. AI yanıt üretir → kaynak gösterir                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Güvenlik

### Kimlik Doğrulama

- JWT Access token (1 saat geçerli)
- JWT Refresh token (7 gün geçerli)
- bcrypt ile şifre hashleme (12 round)

### Yetkilendirme

- Rol tabanlı erişim kontrolü (RBAC)
- Avukat: Kendi verilerine erişim
- Büro Yöneticisi: Ekibi yönetebilir
- Admin: Tüm verilere erişim

### Veri Güvenliği

- TLS 1.3 (aktarım)
- AES-256 (depolama)
- KVKK uyumlu (Minimax Türkiye sunucusu)
- Claude için açık rıza gerekliliği

### Rate Limiting

- 100 istek/dakika (varsayılan)
- Global throttle (ThrottlerGuard)

---

## 🚢 Deploy

### Docker ile

```bash
# Build
docker build -t avocatpro-backend .

# Run
docker run -p 3000:3000 \
  --env-file .env \
  avocatpro-backend
```

### PM2 ile

```bash
# Build
npm run build

# Production'da çalıştır
pm2 start dist/main.js --name avocatpro-backend

# Monitor
pm2 monit
```

### Environment Variables (Production)

```bash
# Production'da güvenli secret yönetimi kullanın
# AWS Secrets Manager, HashiCorp Vault, vb.
```

---

## 🧪 Test

```bash
# Unit test
npm test

# Test coverage
npm run test:cov

# E2E test
npm run test:e2e
```

---

## 🤝 Katkı

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit yapın (`git commit -m 'feat: yeni özellik'`)
4. Push yapın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim

- **Website:** https://avukatpro.com
- **GitHub:** https://github.com/vadi360/AvukatPro
- **Email:** info@avukatpro.com

---

<div align="center">

*Bu proje Türkiye'nin hukuk ekosistemini güçlendirmek için ❤️ ile yapılmıştır.*

**AvukatPro - Hukuk Asistanı**

</div>