# AvukatPro Backend - Sistem Şeması ve Mimarisi

**Versiyon:** 1.0  
**Tarih:** 01 Haziran 2026  
**Durum:** Geliştirme  

---

# 1. SİSTEM GENEL BAKIŞ

## 1.1 Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AVRUKATPRO SİSTEMİ                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│   │   FRONTEND  │       │   FRONTEND  │       │   FRONTEND  │              │
│   │   (Web)     │       │   (Mobil)   │       │  (Eklenti)  │              │
│   │  Next.js    │       │ ReactNative │       │  Chrome Ext│              │
│   │  :3000      │       │   :3001     │       │  Background │              │
│   └──────┬──────┘       └──────┬──────┘       └──────┬──────┘              │
│          │                    │                    │                       │
│          └────────────────────┼────────────────────┘                    │
│                               │                                          │
│                               ▼                                          │
│                    ┌─────────────────────┐                            │
│                    │     API GATEWAY        │                            │
│                    │  (NestJS) Port: 3000   │                            │
│                    │  Swagger: /api/docs   │                            │
│                    └──────────┬────────────┘                            │
│                               │                                        │
│      ┌────────────────────────┼────────────────────────┐               │
│      │                        │                        │               │
│      ▼                        ▼                        ▼               │
│ ┌──────────────┐      ┌──────────────┐        ┌──────────────┐          │
│ │ Auth Service │      │  Core API    │        │  AI Gateway │          │
│ │  Port: 3001 │      │  Port: 3000  │        │  Port: 3002 │          │
│ │  - /auth/*  │      │  - /users/*  │        │  - /ai/*   │          │
│ │  - login    │      │  - /cases/*  │        │  - routing │          │
│ │  - register │      │  - /notif/*  │        │  - Minimax │          │
│ │  - JWT      │      │  - /deleg/*  │        │  - Claude │          │
│ └──────────────┘      │  - /docs/*   │        └──────────────┘          │
│                       │  - /remind/* │                                  │
│                       │  - /admin/*  │                                  │
│                       │  - /uets/*    │                                  │
│                       │  - /files/*   │                                  │
│                       └───────┬────────┘                                  │
│                               │                                          │
│      ┌────────────────────────┼────────────────────────┐                │
│      │                        │                        │                │
│      ▼                        ▼                        ▼                │
│ ┌──────────────┐      ┌──────────────┐        ┌──────────────┐          │
│ │  PostgreSQL  │      │    Redis    │        │   Pinecone   │          │
│ │  Veritabanı  │      │    Cache    │        │  (Vektör DB) │          │
│ │  Port: 5432 │      │  Port: 6379 │        │              │          │
│ └──────────────┘      └──────────────┘        └──────────────┘          │
│                                                                             │
│                    ┌────────────────────────────────┐                  │
│                    │         DIŞ SERVİSLER            │                  │
│                    │                                 │                  │
│                    │  ┌──────────┐  ┌──────────┐   │                  │
│                    │  │ NetGSM   │  │ SendGrid │   │                  │
│                    │  │  (SMS)   │  │ (Email)  │   │                  │
│                    │  └──────────┘  └──────────┘   │                  │
│                    │                                 │                  │
│                    │  ┌──────────┐  ┌──────────┐   │                  │
│                    │  │ Minimax  │  │ Claude  │    │                  │
│                    │  │   API    │  │   API   │    │                  │
│                    │  └──────────┘  └──────────┘   │                  │
│                    │                                 │                  │
│                    │  ┌──────────────────────────┐ │                  │
│                    │  │    CloudFlare R2           │ │                  │
│                    │  │    (Dosya Depolama)        │ │                  │
│                    │  └──────────────────────────┘ │                  │
│                    └────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. MODÜL YAPISI VE BAĞLANTILAR

## 2.1 Modül Haritası

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MODÜL HARİTASI                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   app.module.ts (Ana Modül)                                                │
│   │                                                                        │
│   ├── PrismaModule (Global - Veritabanı Erişimi)                          │
│   │   └── PrismaService                                                    │
│   │       └── Tüm modüller tarafından kullanılır                           │
│   │                                                                         │
│   ├── AuthModule (Kimlik Doğrulama)                                        │
│   │   ├── auth.service.ts          → Kullanıcı kayıt, giriş, token üretimi │
│   │   ├── auth.controller.ts      → /api/v1/auth/* endpoint'leri          │
│   │   ├── strategies/jwt.strategy.ts → JWT doğrulama                       │
│   │   ├── strategies/local.strategy.ts → Email/password doğrulama        │
│   │   ├── guards/jwt-auth.guard.ts → Endpoint koruma                      │
│   │   └── dto/                      → RegisterDto, LoginDto, vb.            │
│   │                                                                         │
│   ├── UsersModule (Kullanıcı İşlemleri)                                    │
│   │   ├── users.service.ts         → Profil, şifre, avukat arama         │
│   │   ├── users.controller.ts      → /api/v1/users/* endpoint'leri        │
│   │   └── dto/                      → ProfileUpdateDto, vb.                │
│   │                                                                         │
│   ├── CasesModule (Dava Dosyası İşlemleri)                                 │
│   │   ├── cases.service.ts          → CRUD, duruşmalar, AI özet            │
│   │   ├── cases.controller.ts      → /api/v1/cases/* endpoint'leri       │
│   │   └── dto/                      → CreateCaseDto, UpdateCaseDto, vb.    │
│   │                                                                         │
│   ├── NotificationsModule (Tebligat İşlemleri)                             │
│   │   ├── notifications.service.ts  → Tebligat listesi, okundu işaretle   │
│   │   ├── notifications.controller.ts → /api/v1/notifications/*           │
│   │   └── dto/                      → MarkReadDto, vb.                    │
│   │                                                                         │
│   ├── DelegationsModule (Tevkil İşlemleri)                                 │
│   │   ├── delegations.service.ts    → Tevkil oluştur, onay, red, puan     │
│   │   ├── delegations.controller.ts → /api/v1/delegations/*              │
│   │   └── dto/                      → CreateDelegationDto, vb.            │
│   │                                                                         │
│   ├── DocumentsModule (Belge İşlemleri)                                   │
│   │   ├── documents.service.ts      → CRUD, üretim, revizyon              │
│   │   ├── documents.controller.ts  → /api/v1/documents/*                 │
│   │   └── dto/                      → CreateDocumentDto, vb.             │
│   │                                                                         │
│   ├── RemindersModule (Hatırlatıcı İşlemleri)                             │
│   │   ├── reminders.service.ts      → Hatırlatıcı oluştur, listele        │
│   │   ├── reminders.controller.ts   → /api/v1/reminders/*                │
│   │   └── dto/                      → CreateReminderDto, vb.              │
│   │                                                                         │
│   ├── AiModule (Yapay Zeka İşlemleri)                                     │
│   │   ├── ai.service.ts             → AI yönlendirme, model seçimi       │
│   │   ├── ai.controller.ts          → /api/v1/ai/* endpoint'leri         │
│   │   ├── providers/minimax.provider.ts → Minimax API                    │
│   │   ├── providers/claude.provider.ts  → Claude API                     │
│   │   └── dto/                      → AiRequestDto, vb.                   │
│   │                                                                         │
│   ├── AdminModule (Yönetici İşlemleri)                                    │
│   │   ├── admin.service.ts          → Kullanıcı yönetimi, AI config        │
│   │   ├── admin.controller.ts       → /api/v1/admin/*                     │
│   │   └── dto/                      → UpdateAiConfigDto, vb.              │
│   │                                                                         │
│   ├── UetsModule (UETS Entegrasyonu)                                      │
│   │   ├── uets.service.ts           → UETS bağlantı, senkronizasyon       │
│   │   ├── uets.controller.ts        → /api/v1/uets/*                     │
│   │   └── dto/                      → ConnectUetsDto, vb.                │
│   │                                                                         │
│   ├── FilesModule (Dosya İşlemleri)                                       │
│   │   ├── files.service.ts          → R2'ye yükleme, indirme             │
│   │   ├── files.controller.ts       → /api/v1/files/*                    │
│   │   └── dto/                      → UploadFileDto, vb.                  │
│   │                                                                         │
│   └── HealthModule (Sistem Sağlığı)                                      │
│       ├── health.controller.ts     → /health, /health/db, /health/redis  │
│       └── health.service.ts        → Sağlık kontrolü                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. VERİTABANI ŞEMASI

## 3.1 Tablolar ve İlişkiler

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERİTABANI ŞEMASI (ERD)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐         1:N        ┌─────────────────┐            │
│   │      users       │────────────────────│  subscriptions  │            │
│   ├─────────────────┤                   └─┤─────────────────┤            │
│   │ id (PK)          │                    │ id (PK)          │            │
│   │ email (UNIQUE)   │                    │ user_id (FK)     │            │
│   │ passwordHash     │                    │ package_type     │            │
│   │ name             │                    │ token_limit      │            │
│   │ phone            │                    │ tokens_used      │            │
│   │ phone_verified   │                    │ start_date       │            │
│   │ avatarUrl        │                    │ end_date         │            │
│   │ baro_reg         │                    │ is_active        │            │
│   │ expertise[]      │                    └──────────────────┘            │
│   │ city             │                                                      │
│   │ district         │         1:N        ┌─────────────────┐            │
│   │ court            │────────────────────│     cases       │            │
│   │ rating           │                   └─┬───────────────┤            │
│   │ rating_count      │                    │ id (PK)         │            │
│   │ subscription_status│                   │ user_id (FK)    │            │
│   │ created_at        │                    │ case_number     │            │
│   │ deleted_at        │                    │ court           │            │
│   └────────┬─────────┘                    │ parties (JSON)  │            │
│            │                              │ subject          │            │
│            │ 1:N                          │ status           │            │
│            │                              │ ai_summary       │            │
│   ┌────────┴────────┐                     │ decision_analysis│           │
│   │  delegations    │                     └────────┬─────────┘            │
│   ├─────────────────┤                      │                    │         │
│   │ id (PK)          │         1:N         │ 1:N                │         │
│   │ from_user_id(FK) │────────────────────┼┘                    │         │
│   │ to_user_id (FK)  │                   │                     │         │
│   │ case_id (FK)     │                   ▼                     │         │
│   │ status            │         ┌─────────────────┐           │         │
│   │ rating            │         │   hearings       │           │         │
│   │ expires_at        │         ├─────────────────┤           │         │
│   └────────┬─────────┘         │ id (PK)         │           │         │
│            │                   │ case_id (FK)    │           │         │
│            │                   │ hearing_date    │           │         │
│   ┌────────┴────────┐         │ status          │           │         │
│   │ notifications   │         └─────────────────┘           │         │
│   ├─────────────────┤                    │                     │         │
│   │ id (PK)          │                   ▼                     │         │
│   │ user_id (FK)     │         ┌─────────────────┐           │         │
│   │ case_id (FK)     │         │   documents     │           │         │
│   │ type             │         ├─────────────────┤           │         │
│   │ content          │         │ id (PK)         │           │         │
│   │ deadline         │         │ user_id (FK)    │           │         │
│   │ is_read          │         │ case_id (FK)    │           │         │
│   │ uets_read         │         │ type            │           │         │
│   └─────────────────┘         │ content         │           │         │
│                               │ file_url        │           │         │
│   ┌─────────────────┐         │ status          │           │         │
│   │   reminders      │         │ ai_model_used   │           │         │
│   ├─────────────────┤         └─────────────────┘           │         │
│   │ id (PK)          │                                     │         │
│   │ user_id (FK)     │         ┌─────────────────┐         │         │
│   │ case_id (FK)     │         │   ai_config     │         │         │
│   │ notification_id  │         ├─────────────────┤         │         │
│   │ type             │         │ id (PK)         │         │         │
│   │ due_date         │         │ task_name (U)   │         │         │
│   │ status           │         │ model           │         │         │
│   └─────────────────┘         │ is_active       │         │         │
│                               └─────────────────┘         │         │
│   ┌─────────────────┐                       │                     │         │
│   │  audit_logs     │                       │                     │         │
│   ├─────────────────┤                       │                     │         │
│   │ id (PK)          │                       │                     │         │
│   │ user_id (FK)     │                       ▼                     │         │
│   │ action           │         ┌─────────────────────────┐         │         │
│   │ entity_type       │         │     user_tokens        │         │         │
│   │ entity_id        │         ├─────────────────────────┤         │         │
│   │ old_value (JSON) │         │ id (PK)                │         │         │
│   │ new_value (JSON) │         │ user_id (FK)           │         │         │
│   │ ip_address       │         │ token_amount          │         │         │
│   │ created_at        │         │ ai_model              │         │         │
│   └─────────────────┘         │ task_type             │         │         │
│                               │ period_start          │         │         │
│   ┌─────────────────┐         │ period_end            │         │         │
│   │  uets_sessions   │         └─────────────────────────┘         │         │
│   ├─────────────────┤                                               │         │
│   │ id (PK)          │                                               │         │
│   │ user_id (FK)     │                                               │         │
│   │ encrypted_cred   │                                               │         │
│   │ session_data     │                                               │         │
│   │ last_sync_at     │                                               │         │
│   │ is_active        │                                               │         │
│   └─────────────────┘                                               │         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Tablo Açıklamaları

| Tablo | Açıklama | Ana İlişkiler |
|-------|----------|---------------|
| **users** | Avukat kullanıcılar | 1:N subscriptions, cases, notifications, delegations, documents, reminders |
| **subscriptions** | Abonelik paketleri | N:1 users |
| **cases** | Dava dosyaları | N:1 users, 1:N hearings, notifications, delegations, documents, reminders |
| **hearings** | Duruşmalar | N:1 cases |
| **notifications** | Tebligatlar | N:1 users, cases |
| **delegations** | Tevkiller | N:1 from_user (users), N:1 to_user (users), N:1 cases |
| **documents** | Belgeler | N:1 users, cases |
| **reminders** | Hatırlatıcılar | N:1 users, cases, notifications |
| **ai_config** | AI görev yapılandırması | - |
| **user_tokens** | Token kullanım takibi | N:1 users |
| **uets_sessions** | UETS oturum bilgileri | N:1 users |
| **audit_logs** | Denetim kayıtları | N:1 users |

---

# 4. API ENDPOINTS

## 4.1 Endpoint Yapısı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS LİSTESİ                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BASE URL: /api/v1                                                         │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ AUTH MODÜLÜ (/auth)                                                  │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  POST /auth/register     → Yeni kayıt                                │ │
│  │  POST /auth/login        → Giriş (email + şifre)                    │ │
│  │  POST /auth/logout       → Çıkış (JWT gerekli)                      │ │
│  │  POST /auth/refresh      → Token yenile                               │ │
│  │  POST /auth/forgot-password → Şifre unuttum                            │ │
│  │  POST /auth/verify-otp   → OTP doğrulama                              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ USERS MODÜLÜ (/users)                                               │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET  /users/profile      → Kendi profilim (JWT)                     │ │
│  │  PUT  /users/profile      → Profil güncelle (JWT)                     │ │
│  │  PUT  /users/password     → Şifre değiştir (JWT)                      │ │
│  │  GET  /users/search       → Avukat ara (JWT)                         │ │
│  │  GET  /users/:id          → Kullanıcı profili (JWT)                   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ CASES MODÜLÜ (/cases)                                               │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET    /cases            → Dosya listesi (JWT)                      │ │
│  │  POST   /cases            → Yeni dosya oluştur (JWT)                   │ │
│  │  GET    /cases/:id        → Dosya detay (JWT)                        │ │
│  │  PUT    /cases/:id        → Dosya güncelle (JWT)                      │ │
│  │  DELETE /cases/:id        → Dosya sil (JWT)                           │ │
│  │  GET    /cases/:id/hearings → Duruşmalar (JWT)                       │ │
│  │  POST   /cases/:id/hearings → Duruşma ekle (JWT)                      │ │
│  │  GET    /cases/:id/ai-summary → AI özet (JWT)                        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ NOTIFICATIONS MODÜLÜ (/notifications)                                │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET    /notifications              → Tebligat listesi (JWT)         │ │
│  │  GET    /notifications/:id         → Tebligat detay (JWT)           │ │
│  │  PUT    /notifications/:id/read     → Okundu işaretle (JWT)          │ │
│  │  PUT    /notifications/:id/star     → Yıldızla (JWT)                 │ │
│  │  POST   /notifications/:id/reminder → Hatırlatıcı ekle (JWT)          │ │
│  │  GET    /notifications/unread-count → Okunmamış sayısı (JWT)         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ DELEGATIONS MODÜLÜ (/delegations)                                   │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET    /delegations              → Tevkil listesi (JWT)             │ │
│  │  POST   /delegations              → Yeni tevkil oluştur (JWT)         │ │
│  │  GET    /delegations/:id         → Tevkil detay (JWT)               │ │
│  │  PUT    /delegations/:id/approve → Tevkili onayla (JWT)              │ │
│  │  PUT    /delegations/:id/reject   → Tevkili reddet (JWT)             │ │
│  │  PUT    /delegations/:id/cancel   → Tevkili iptal (JWT)              │ │
│  │  PUT    /delegations/:id/complete → Tevkili tamamla (JWT)            │ │
│  │  POST   /delegations/:id/rate     → Puanla (JWT)                     │ │
│  │  GET    /delegations/recommended → Önerilen avukatlar (JWT)          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ DOCUMENTS MODÜLÜ (/documents)                                      │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET    /documents              → Belge listesi (JWT)              │ │
│  │  POST   /documents              → Yeni belge oluştur (JWT)          │ │
│  │  GET    /documents/:id         → Belge detay (JWT)                 │ │
│  │  PUT    /documents/:id          → Belge güncelle (JWT)              │ │
│  │  DELETE /documents/:id          → Belge sil (JWT)                   │ │
│  │  GET    /documents/:id/download → İndir (JWT)                        │ │
│  │  POST   /documents/:id/revise   → Revize iste (JWT)                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ AI MODÜLÜ (/ai)                                                    │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  POST   /ai/summarize         → Tebligat özetle (JWT)               │ │
│  │  POST   /ai/deadline-extract  → Süre çıkar (JWT)                     │ │
│  │  POST   /ai/case-summary      → Dosya özeti (JWT)                   │ │
│  │  POST   /ai/document-generate → Dilekçe üret (JWT)                   │ │
│  │  POST   /ai/document-revise   → Dilekçe revize (JWT)                │ │
│  │  POST   /ai/legal-research     → İçtihat ara (JWT)                   │ │
│  │  POST   /ai/analyze-decision  → Karar analiz (JWT)                  │ │
│  │  POST   /ai/chat              → Genel soru (JWT)                   │ │
│  │  GET    /ai/config            → AI yapılandırma (Admin)            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ ADMIN MODÜLÜ (/admin)                                              │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET    /admin/users            → Tüm kullanıcılar (Admin)         │ │
│  │  PUT    /admin/users/:id        → Kullanıcı güncelle (Admin)         │ │
│  │  DELETE /admin/users/:id        → Kullanıcı sil (Admin)              │ │
│  │  GET    /admin/stats           → İstatistikler (Admin)              │ │
│  │  GET    /admin/ai-config       → AI yapılandırma (Admin)           │ │
│  │  PUT    /admin/ai-config/:task → AI görev güncelle (Admin)          │ │
│  │  POST   /admin/broadcast        → Toplu bildirim (Admin)             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ UETS MODÜLÜ (/uets)                                               │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  POST   /uets/connect         → UETS bağlantısı kur (JWT)           │ │
│  │  DELETE /uets/disconnect      → UETS bağlantısını kes (JWT)          │ │
│  │  GET    /uets/status          → Bağlantı durumu (JWT)               │ │
│  │  GET    /uets/notifications   → UETS tebligatları (JWT)            │ │
│  │  POST   /uets/sync            → Manuel senkron (JWT)                │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ FILES MODÜLÜ (/files)                                              │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  POST   /files/upload         → Dosya yükle (JWT)                   │ │
│  │  GET    /files/:id           → Dosya indir (JWT)                   │ │
│  │  DELETE /files/:id            → Dosya sil (JWT)                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ HEALTH MODÜLÜ (/health)                                            │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET    /health              → Genel sağlık                       │ │
│  │  GET    /health/db           → Veritabanı sağlığı                 │ │
│  │  GET    /health/redis        → Redis sağlığı                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 5. AI YAPILANDIRMASI

## 5.1 AI Görev Tablosu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI GÖREV YAPILANDIRMASI                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  | Görev                | Varsayılan Model | Kritik | Açıklama            │
│  |----------------------|-----------------|--------|----------------------|
│  | notification_summary | MINIMAX        | Hayır   | Tebligat özetleme    |
│  | deadline_extract      | CLAUDE         | Evet    | Süre çıkarımı (kritik)|
│  | case_summary         | MINIMAX        | Hayır   | Dosya özeti          |
│  | decision_analysis    | CLAUDE         | Evet    | Karar analizi (kritik)|
│  | document_generate    | MINIMAX        | Hayır   | Dilekçe üretimi       |
│  | document_revise      | MINIMAX        | Hayır   | Dilekçe revizyonu     |
│  | legal_notice         | MINIMAX        | Hayır   | İhtarname üretimi    |
│  | legal_research       | CLAUDE         | Evet    | İçtihat ara (kritik) |
│  | general_qa           | MINIMAX        | Hayır   | Genel soru-cevap      |
│                                                                             │
│  Not: Admin panelden her görev için model değiştirilebilir                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 AI Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI İŞLEME AKIŞI                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Client Request                                                            │
│   │                                                                        │
│   ▼                                                                        │
│   ┌──────────────┐                                                          │
│   │  /ai/*      │  API isteği                                              │
│   │  Endpoint   │                                                          │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│   ┌──────────────┐                                                          │
│   │ JwtAuthGuard │  Token doğrulama                                        │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│   ┌──────────────┐                                                          │
│   │  AiService  │  AI Service                                             │
│   │ process()   │  - Görev tipini al                                       │
│   └──────┬───────┘  - ai_config tablosundan model'ı çek                    │
│          │                                                                  │
│          ▼                                                                  │
│   ┌──────────────┐                                                          │
│   │ Model Seçimi │  MINIMAX mı CLAUDE mi?                                  │
│   │              │  (ai_config.taskName'e göre)                            │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│    ┌─────┴─────┐                                                            │
│    │          │                                                            │
│    ▼          ▼                                                            │
│   ┌──────┐ ┌───────┐                                                       │
│   │Mini  │ │Claude│  Provider Seçimi                                        │
│   │max   │ │      │                                                        │
│   └──┬───┘ └───┬───┘                                                        │
│      │         │                                                            │
│      ▼         ▼                                                            │
│   ┌──────────────────┐                                                      │
│   │   AI API Call    │  Minimize/Claude API'ye istek gönder               │
│   │                  │  - System prompt                                     │
│   │                  │  - User input                                        │
│   │                  │  - Temperature, max_tokens                            │
│   └────────┬─────────┘                                                      │
│            │                                                                │
│            ▼                                                                │
│   ┌──────────────┐                                                          │
│   │ Token Usage  │  Kullanılan token'i kaydet (user_tokens tablosu)       │
│   │ Recording    │                                                          │
│   └──────┬───────┘                                                          │
│          │                                                                  │
│          ▼                                                                  │
│   ┌──────────────┐                                                          │
│   │   Response   │  AI yanıtını döndür                                     │
│   │   Format     │  - text, tokensUsed, confidence, metadata               │
│   └──────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. GÜVENLİK VE YETKİLENDİRME

## 6.1 Kimlik Doğrulama Akışı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JWT AUTHENTICATION AKIŞI                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. KAYIT/LOGIN                                                          │
│   ┌────────────┐                                                          │
│   │ POST      │ Email + Password                                          │
│   │ /auth/    │                                                          │
│   │ register  │                                                          │
│   └─────┬──────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐      bcrypt.compare()                                    │
│   │ Validate  │ ──── Password Hash Check ───→ OK/FAIL                     │
│   │ Password  │                                                          │
│   └─────┬────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐                                                          │
│   │ Generate │ ──── JWT Access + Refresh Token                           │
│   │ Tokens   │     Access: 1h, Refresh: 7d                                │
│   └─────┬────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐                                                          │
│   │ Response │ ──── { accessToken, refreshToken, user }                   │
│   │          │                                                          │
│   └────────────┘                                                          │
│                                                                             │
│   2. KORUMALI ENDPOINT'E İSTEK                                            │
│   ┌────────────┐                                                          │
│   │ Request   │ ──── Authorization: Bearer <accessToken>                  │
│   │ with JWT  │                                                          │
│   └─────┬──────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐                                                          │
│   │ JwtGuard  │ ──── Extract token from header                           │
│   │ canActive │                                                          │
│   └─────┬────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐      verify()                                            │
│   │ Validate │ ──── Check signature & expiry                             │
│   │ JWT      │     ──── Success/Fail                                     │
│   └─────┬────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐      payload = { sub: userId, email }                   │
│   │ Extract   │                                                          │
│   │ Payload   │                                                          │
│   └─────┬────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐                                                          │
│   │ req.user  │ ──── { userId, email }                                    │
│   │ = payload │     Controller'da erişilebilir                            │
│   └────────────┘                                                          │
│                                                                             │
│   3. TOKEN YENİLEME                                                       │
│   ┌────────────┐                                                          │
│   │ POST      │ ──── { refreshToken }                                     │
│   │ /auth/    │                                                          │
│   │ refresh   │                                                          │
│   └─────┬──────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐      verify() with REFRESH_SECRET                       │
│   │ Validate  │ ──── Check refresh token validity                        │
│   │ Refresh  │     ──── OK/FAIL                                          │
│   └─────┬────┘                                                          │
│         │                                                                 │
│         ▼                                                                 │
│   ┌────────────┐                                                          │
│   │ Generate  │ ──── New Access + Refresh Token                          │
│   │ New Tokens│                                                          │
│   └────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Rol ve Yetkilendirme

| Rol | Yetkiler |
|-----|----------|
| **Avukat (User)** | Kendi verilerine erişim, tevkil oluşturma/kabul etme, belge üretme |
| **Admin** | Tüm kullanıcı verileri, AI yapılandırma, sistem ayarları |

---

# 7. DOSYA YAPISI

## 7.1 Proje Yapısı

```
backend/
├── src/
│   ├── main.ts                          # Uygulama giriş noktası
│   ├── app.module.ts                    # Ana modül
│   │
│   ├── config/
│   │   └── (Configuration dosyaları)
│   │
│   ├── common/
│   │   ├── decorators/                  # Özel decorator'lar (@Public, vb.)
│   │   ├── filters/                     # Exception filtreleri
│   │   ├── guards/                       # Guard'lar (JwtAuthGuard vb.)
│   │   ├── interceptors/                  # Interceptor'lar (logging vb.)
│   │   ├── pipes/                        # Validation pipe'lar
│   │   └── utils/                        # Yardımcı fonksiyonlar
│   │
│   └── modules/
│       ├── auth/                         # Kimlik doğrulama
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
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
│       ├── users/                       # Kullanıcı işlemleri
│       ├── cases/                       # Dava dosyaları
│       ├── notifications/               # Tebligatlar
│       ├── delegations/                 # Tevkiller
│       ├── documents/                   # Belgeler
│       ├── reminders/                   # Hatırlatıcılar
│       ├── ai/                          # Yapay zeka
│       │   ├── ai.module.ts
│       │   ├── ai.controller.ts
│       │   ├── ai.service.ts
│       │   └── providers/
│       │       ├── minimax.provider.ts
│       │       └── claude.provider.ts
│       ├── admin/                      # Yönetici işlemleri
│       ├── uets/                       # UETS entegrasyonu
│       ├── files/                       # Dosya işlemleri
│       ├── health/                     # Sağlık kontrolü
│       └── prisma/                     # Veritabanı modülü
│           ├── prisma.module.ts
│           ├── prisma.service.ts
│           └── schema.prisma
│
├── prisma/
│   ├── schema.prisma                    # Veritabanı şeması
│   ├── seed.ts                         # Tohum verileri
│   └── migrations/                    # Migration dosyaları
│
├── test/
│   └── (Test dosyaları)
│
├── .env.example                        # Environment şablonu
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

# 8. ÇALIŞTIRMA VE KURULUM

## 8.1 Geliştirme Ortamı

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Environment dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle (veritabanı, API key'ler, vs.)

# 3. Prisma migration çalıştır
npm run prisma:migrate

# 4. Tohum verilerini yükle (opsiyonel)
npm run prisma:seed

# 5. Geliştirme sunucusunu başlat
npm run start:dev
```

## 8.2 Production

```bash
# Build
npm run build

# PM2 ile çalıştır
pm2 start dist/main.js --name avocatpro-backend

# veya Docker ile
npm run docker:build
npm run docker:run
```

## 8.3 API Dokümantasyonu

Swagger UI: `http://localhost:3000/api/docs`

---

# 9. ÖNEMLİ NOTLAR

## 9.1 Güvenlik

1. **Environment Değişkenleri**: API key'ler ve şifreler asla versiyon kontrolüne atılmamalı
2. **JWT Secret**: Production'da güvenli ve tahmin edilemez bir değer kullanılmalı
3. **Rate Limiting**: DDoS koruması için aktif
4. **CORS**: Sadece izin verilen origin'lerden istek kabul edilir

## 9.2 Performans

1. **Veritabanı İndeksleri**: Sık kullanılan sorgular için indeksler mevcut
2. **Redis Cache**: Session ve sık erişilen veriler için
3. **Connection Pool**: PostgreSQL bağlantı havuzu

## 9.3 KVKK Uyumu

1. **Veri Türkiye'de**: Minimax Türkiye sunucusu kullanılıyor
2. **Claude Kullanımı**: Müvekkil verileri için açık rıza gerekli
3. **Şifreleme**: TLS 1.3 + AES-256

---

*Son güncelleme: 01 Haziran 2026*  
*Versiyon: 1.0*