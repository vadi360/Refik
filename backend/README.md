<p align="center">
  <img src="https://refik.app/banner.png" alt="Refik Banner" width="100%" />
</p>

<div align="center">

# Refik Backend API

*Türkiye'nin Hukuk Asistanı - Backend API*

[![NestJS](https://img.shields.io/badge/nestjs-10-E0234E?style=flat-square&logo=NestJS)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-3178C6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/node-18+-68217A?style=flat-square&logo=Node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14-4169E1?style=flat-square&logo=PostgreSQL)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/prisma-5.x-5A67D8?style=flat-square&logo=Prisma)](https://www.prisma.io)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

| 🔧 | Değer |
|----|-------|
| **Versiyon** | 2.0 |
| **Framework** | NestJS 10 |
| **Language** | TypeScript 5.3 |
| **Database** | PostgreSQL 14+ |
| **ORM** | Prisma 5.x |
| **API Style** | REST + Swagger |
| **Auth** | JWT + OTP |
| **Modules** | 21 modül |
| **Endpoints** | ~90+ |

**API Docs:** [api.refik.app/api/docs](https://api.refik.app/api/docs)  
**Health Check:** [api.refik.app/api/health](https://api.refik.app/api/health)

</div>

---

## 🚀 Quick Start

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Environment dosyası
cp .env.example .env

# 3. Veritabanı migration
npx prisma migrate dev

# 4. Geliştirme sunucusu
npm run start:dev
```

**Swagger Docs:** `http://localhost:3000/api/docs`

---

## 📦 Modüller (21 Adet)

| # | Modül | Endpoints | Açıklama |
|---|-------|-----------|----------|
| 1 | **Auth** | 7 | JWT + OTP kimlik doğrulama |
| 2 | **Users** | 8 | Kullanıcı yönetimi, Baro onay |
| 3 | **Cases** | 10 | Dava dosyaları, taraflar |
| 4 | **Hearings** | 8 | Duruşma takibi |
| 5 | **Notifications** | 12 | Tebligatlar, 5 gün kuralı |
| 6 | **AI** | 10 | Minimax + Claude hibrit |
| 7 | **Case Update** | 6 | AI dosya güncelleme |
| 8 | **Delegations** | 10 | Tevkil pazarı |
| 9 | **Documents** | 8 | Belge yükleme, RAG indeksleme |
| 10 | **User Documents** | 6 | Kullanıcı belgeleri |
| 11 | **UYAP** | 6 | UYAP scraping |
| 12 | **UETS** | 6 | UETS entegrasyonu |
| 13 | **RAG** | 5 | Pinecone vektör arama |
| 14 | **Payments** | 8 | iyzico, PayTR, Stripe |
| 15 | **Icra** | 10 | İcra takibi |
| 16 | **Call Center** | 6 | Borçlu arama takibi |
| 17 | **Calendar** | 10 | Birleşik takvim |
| 18 | **Reminders** | 8 | Hatırlatıcılar |
| 19 | **Admin** | 12 | Yönetim paneli |
| 20 | **Cron** | - | Zamanlı işlemler |
| 21 | **Health** | 2 | Sağlık kontrolü |

---

## 🤖 AI Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Hibrit Sistemi                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐          ┌─────────────────┐         │
│   │    MINIMAX      │          │     CLAUDE      │         │
│   │      M2.7       │          │   Sonnet 4      │         │
│   │   (Türkiye/KVKK)│          │    (Admin)      │         │
│   └────────┬────────┘          └────────┬────────┘         │
│            │                            │                    │
│            │   Admin tarafından         │                    │
│            │   görev bazlı seçim        │                    │
│            │                            │                    │
│   ├────────┴────────┴────────────────────┴────────┤         │
│   │                                                │         │
│   │  • notification_summary (sınırsız)           │         │
│   │  • deadline_extract (sınırsız)                │         │
│   │  • case_summary            • legal_research  │         │
│   │  • document_generate       • decision_analysis│         │
│   │  • general_qa                                │         │
│   │                                                │         │
│   └───────────────────────────────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Görevleri

| Görev | Model | Token Limit | Açıklama |
|-------|-------|------------|----------|
| `notification_summary` | MINIMAX | **Sınırsız** | Tebligat özetleme |
| `deadline_extract` | CLAUDE | **Sınırsız** | Süre çıkarımı |
| `case_summary` | MINIMAX | Var | Dosya özetleme |
| `document_generate` | MINIMAX | Var | Dilekçe üretimi |
| `document_revise` | MINIMAX | Var | Dilekçe revizyonu |
| `legal_notice` | MINIMAX | Var | İhtarname |
| `legal_research` | CLAUDE | Var | İçtihat araştırması |
| `decision_analysis` | CLAUDE | Var | Karar analizi |
| `general_qa` | MINIMAX | Var | Genel soru-cevap |

---

## 🗄️ Veritabanı Şeması (23 Model)

```
┌─────────────────────────────────────────────────────────────┐
│                       Veritabanı Modelleri                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User ◄────────── Subscription ◄────────── Payment         │
│    │                   │                                   │
│    ├──── Case ◄─────── Hearing ◄────────── Notification     │
│    │                                                       │
│    ├──── Delegation ◄───── Complaint                       │
│    │                                                       │
│    ├──── Document ◄──── DocumentEmbedding (Pinecone)       │
│    │                                                       │
│    ├──── Reminder ◄──── NotificationLog                    │
│    │                                                       │
│    ├──── AiConfig ◄──── AiConfigUpdate                     │
│    │                                                       │
│    ├──── UserToken (token takibi)                          │
│    ├──── UetsSession                                       │
│    ├──── AuditLog                                          │
│    ├──── UserDocument                                      │
│    │                                                       │
│    └──── IcraFile ◄─── IcraPayment                         │
│               ◄─── IcraCallRecord                          │
│               ◄─── IcraAssetHistory                        │
│                                                             │
│    NotificationTemplate                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📬 Bildirim Sistemi (5 Kanal)

| Kanal | Servis | Durum |
|-------|--------|-------|
| 🔔 **Push Bildirim** | Firebase FCM | ✅ |
| 📱 **SMS** | NetGSM | ✅ |
| 📧 **E-posta** | SendGrid | ✅ |
| 💬 **WhatsApp** | Twilio | ✅ |
| ✈️ **Telegram** | Bot API | ✅ |

---

## 🔐 Güvenlik

| Özellik | Değer |
|---------|-------|
| **JWT Access Token** | 1 saat geçerli |
| **Refresh Token** | 7 gün geçerli |
| **OTP** | 6 haneli, 5 dakika geçerli |
| **Şifreleme** | TLS 1.3, bcrypt |
| **Rate Limiting** | 100 req/min |
| **KVKK** | 6698 sayılı kanun uyumlu |

---

## 🔄 5 Gün Kuralı Otomasyonu

```typescript
// Cron her saat çalışır
// 1. UETS'den yeni tebligatları çek
// 2. AI ile özet çıkar (notification_summary)
// 3. Süre hesapla (deadline_extract)
// 4. Hatırlatıcı oluştur
// 5. Push bildirim gönder
```

| Adım | Açıklama |
|------|----------|
| 1 | `uetsAutoProcessAt <= now` kontrolü |
| 2 | MINIMAX ile tebligat özeti |
| 3 | CLAUDE ile süre çıkarımı |
| 4 | Otomatik hatırlatıcı oluşturma |
| 5 | FCM push bildirimi gönder |

---

## 🛠️ Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis (opsiyonel)

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Environment dosyası
cp .env.example .env

# Environment değişkenleri:
# DATABASE_URL=postgresql://user:pass@localhost:5432/refik
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key
# MINIMAX_API_KEY=your-minimax-key
# CLAUDE_API_KEY=your-claude-key
# PINECONE_API_KEY=your-pinecone-key

# 3. Veritabanı migration
npx prisma migrate dev

# 4. Seed data (opsiyonel)
npx prisma db seed

# 5. Geliştirme
npm run start:dev

# 6. Production
npm run build
npm run start:prod
```

### Docker

```bash
# Docker Compose ile çalıştır
docker-compose up -d

# Sadece backend
docker build -t refik-backend .
docker run -p 3000:3000 refik-backend
```

---

## 🌐 Environment Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | Hayır |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `JWT_EXPIRES_IN` | Token expiration (default: 1h) | Hayır |
| `MINIMAX_API_KEY` | Minimax API key | ✅ |
| `CLAUDE_API_KEY` | Claude API key | ✅ |
| `PINECONE_API_KEY` | Pinecone API key | ✅ |
| `FCM_PROJECT_ID` | Firebase project ID | Hayır |
| `NETGSM_USER` | NetGSM username | Hayır |
| `NETGSM_PASS` | NetGSM password | Hayır |
| `SENDGRID_API_KEY` | SendGrid API key | Hayır |
| `TWILIO_ACCOUNT_SID` | Twilio SID | Hayır |
| `TWILIO_AUTH_TOKEN` | Twilio token | Hayır |
| `IYZICO_BASE_URL` | iyzico API URL | Hayır |
| `IYZICO_API_KEY` | iyzico API key | Hayır |
| `IYZICO_SECRET_KEY` | iyzico secret key | Hayır |
| `PAYTRE_MERCHANT_ID` | PayTR merchant ID | Hayır |
| `PAYTRE_MERCHANT_KEY` | PayTR merchant key | Hayır |
| `PAYTRE_MERCHANT_SALT` | PayTR merchant salt | Hayır |
| `STRIPE_SECRET_KEY` | Stripe secret key | Hayır |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Hayır |

---

## 📊 Health Check

```bash
# Basit health check
curl https://api.refik.app/api/health

# Detaylı (database, redis, external services)
curl https://api.refik.app/api/health/detailed
```

**Yanıt:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-02T00:00:00.000Z",
  "uptime": 12345,
  "services": {
    "database": "connected",
    "redis": "connected",
    "minimax": "ok",
    "claude": "ok"
  }
}
```

---

## 🚢 Deploy

### AWS (EC2 + RDS)

```bash
# 1. EC2 oluştur (Ubuntu 22.04)
# 2. PostgreSQL RDS oluştur
# 3. Environment değişkenlerini ayarla
# 4. PM2 ile deploy
npm install -g pm2
pm2 start dist/src/main.js --name refik-backend
```

### Docker + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/refik
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
```

---

## 📝 API Örnekleri

### Kayıt
```bash
curl -X POST https://api.refik.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Av. Ahmet Yılmaz",
    "email": "ahmet@lawfirm.com",
    "phone": "+905551234567",
    "password": "SecurePass123!",
    "baroId": "34",
    "licenseNumber": "12345"
  }'
```

### AI Özetleme
```bash
curl -X POST https://api.refik.app/api/v1/ai/case-update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "uuid-here",
    "newContent": "Bugün yeni bir tebligat geldi..."
  }'
```

---

## 📄 Lisans

**MIT License** - Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

---

<div align="center">

**Vadi360** tarafından 💜 ile geliştirildi

[refik.app](https://refik.app) | [github.com/vadi360](https://github.com/vadi360) | [vadi360.com](https://vadi360.com)

</div>