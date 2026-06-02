<p align="center">
  <img src="https://refik.app/banner.png" alt="Refik Banner" width="100%" />
</p>

<div align="center">

# Refik

*Mobil öncelikli, AI destekli hukuk asistanı ve tevkil pazar yeri*

[![Status](https://img.shields.io/badge/status-BETA-yellow?style=flat-square&logo=.Statuspage)](https://refik.app)
[![Version](https://img.shields.io/badge/version-1.0.0-3B82F6?style=flat-square)](https://github.com/vadi360/Refik)
[![License](https://img.shields.io/badge/license-AGPLv3-green?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-18+-68217A?style=flat-square&logo=Node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-3178C6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/nestjs-10-E0234E?style=flat-square&logo=NestJS)](https://nestjs.com)
[![React](https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=React)](https://reactjs.org)
[![React Native](https://img.shields.io/badge/react%20native-Expo-000000?style=flat-square&logo=Expo)](https://expo.dev)

---

| 🟢 | **Backend API** | %100 | NestJS + TypeScript |
|---|------------------|-------|----------------------|
| 🟡 | **Web Uygulaması** | Planlanıyor | Next.js + PWA |
| 🟡 | **Mobil Uygulama** | Planlanıyor | React Native |
| 🟡 | **Admin Panel** | Planlanıyor | Next.js |
| 🟢 | **Chrome Eklentisi** | %95 | Manifest V3 |

**Versiyon:** 1.0 | **Tarih:** 02 Haziran 2026  
**Website:** [refik.app](https://refik.app) | **API:** [api.refik.app](https://api.refik.app)  
**GitHub:** [github.com/vadi360/Refik](https://github.com/vadi360/Refik)

</div>

---

## 🎯 Ne İşe Yarar?

<p align="center">
  <img src="https://img.shields.io/badge/📋-Tebligat%20Takibi-10B981?style=for-the-badge" alt="Tebligat Takibi" />
  <img src="https://img.shields.io/badge/⏰-5%20Gün%20Kuralı-3B82F6?style=for-the-badge" alt="5 Gün Kuralı" />
  <img src="https://img.shields.io/badge/🤖-AI%20Özetleme-F59E0B?style=for-the-badge" alt="AI Özetleme" />
  <img src="https://img.shields.io/badge/⚖️-Tevkil%20Pazarı-8B5CF6?style=for-the-badge" alt="Tevkil Pazarı" />
  <img src="https://img.shields.io/badge/📅-Takvim-EC4899?style=for-the-badge" alt="Takvim" />
</p>

> **Avukatlar için tasarlanmış, günlük işlerinizi %70 otomatikleştiren yapay zeka destekli hukuk asistanı.**

---

## ✨ Özellikler

### 📱 Core Features

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| 🔐 **JWT + OTP Giriş** | Telefon ile kayıt, çoklu oturum | ✅ |
| 📋 **Dava Yönetimi** | CRUD, duruşma takibi, taraflar | ✅ |
| 🔔 **UETS 5 Gün Kuralı** | AI otomatik işleme + hatırlatıcı | ✅ |
| 📄 **AI Özetleme** | Dosya özetleri, süre çıkarımı | ✅ |
| 📊 **RAG Sistemi** | Pinecone vektör arama | ✅ |
| 🔍 **UYAP Entegrasyonu** | Chrome eklentisi ile scraping | ✅ |
| ⚖️ **Tevkil Pazarı** | Avukatlar arası duruşma devri | ✅ |
| 💳 **Ödeme Sistemleri** | iyzico, PayTR, Stripe | ✅ |
| 📅 **Birleşik Takvim** | Tüm veri kaynakları | ✅ |
| 📱 **Push Bildirimler** | FCM, SMS, Email, WhatsApp, Telegram | ✅ |
| 📝 **İcra Takibi** | Toplu takip, mal varlığı tespiti | ✅ |
| 📄 **AI Belge Üretimi** | Dilekçe, ihtarname, içtihat | ✅ |

### 🤖 AI Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Hibrit Sistemi                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐              ┌─────────────┐             │
│   │  MINIMAX    │              │   CLAUDE    │             │
│   │   M2.7      │              │  Sonnet 4   │             │
│   │  (Türkiye)  │              │  (Admin)    │             │
│   └──────┬──────┘              └──────┬──────┘             │
│          │                            │                     │
│          │   Görev Bazlı Yönlendirme  │                     │
│          │                            │                     │
│   • notification_summary    • deadline_extract             │
│   • case_summary            • legal_research               │
│   • document_generate       • decision_analysis            │
│   • general_qa                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 💰 Fiyatlandırma

| Plan | Fiyat | AI Token | Özellikler |
|------|-------|---------|---------------|
| **Basic** | Ücretsiz | — | Tevkil Pazarı, Takvim, Bilgi Bankası, Kanun Arama *(Sınırsız)* |
| **Standard** | ₺299/ay | — | + Tebligat Takibi (AI analizli), UYAP Entegrasyonu, Dosya Yönetimi *(Sınırsız)* |
| **Professional** | ₺749/ay | 500 Token/ay | + AI Belge Üretimi, Özet Çıkarma, Dilekçe Hazırlama, İçtihat Arama |

> ⚠️ **Token Sistemi:** Professional paketinde her ay 500 AI token verilir. Token bitince otomatik bakiye yüklemesi yapılır (kredi kartı tanımlanır). Kullanım başına token düşer.

> 💡 **Sınırsız Özellikler:** Tevkil, Takvim, Bilgi Bankası, Kanun Arama, Tebligat ve UYAP tüm paketlerde sınırsızdır. AI token'ı yalnızca AI destekli özelliklerde (belge üretimi, özet, içtihat araştırması vb.) kullanılır.

---

## 🏗️ Teknoloji Stack

### Backend
<div align="left">

![NestJS](https://img.shields.io/badge/-NestJS-E0234E?style=for-the-badge&logo=NestJS&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white)
![Prisma](https://img.shields.io/badge/-Prisma-5A67D8?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/-Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white)

</div>

### AI & Vector Search
<div align="left">

![OpenAI](https://img.shields.io/badge/-Minimax%20M2.7-FF6B6B?style=for-the-badge&logo=Minimax&logoColor=white)
![Claude](https://img.shields.io/badge/-Claude%20Sonnet-4B0082?style=for-the-badge&logo=Anthropic&logoColor=white)
![Pinecone](https://img.shields.io/badge/-Pinecone-4B0082?style=for-the-badge)
![Weaviate](https://img.shields.io/badge/-Weaviate-4B0082?style=for-the-badge)

</div>

### Frontend
<div align="left">

![Next.js](https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=React&logoColor=black)
![React Native](https://img.shields.io/badge/-React%20Native-000000?style=for-the-badge&logo=React&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white)
![Zustand](https://img.shields.io/badge/-Zustand-F59E0B?style=for-the-badge&logo=Zustand&logoColor=white)

</div>

### Altyapı
<div align="left">

![Docker](https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white)
![AWS](https://img.shields.io/badge/-AWS-FF9900?style=for-the-badge&logo=AmazonAWS&logoColor=white)
![Nginx](https://img.shields.io/badge/-Nginx-009639?style=for-the-badge&logo=Nginx&logoColor=white)
![Cloudflare](https://img.shields.io/badge/-Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)

</div>

---

## 📁 Proje Yapısı

```
Refik/
├── backend/                    # NestJS Backend API (21 modül)
│   ├── src/
│   │   ├── modules/           # Auth, Users, Cases, AI, vb.
│   │   └── prisma/            # Veritabanı şeması (23 model)
│   └── README.md
│
├── web/                       # Next.js Web Uygulaması (PWA)
│   ├── src/
│   │   ├── app/              # App Router
│   │   └── components/       # UI Bileşenleri
│   └── README.md
│
├── mobile/                    # React Native Mobil Uygulama
│   ├── src/
│   │   ├── screens/          # Ekranlar
│   │   └── components/       # UI Bileşenleri
│   └── README.md
│
├── admin/                     # Next.js Admin Panel
│   ├── src/
│   │   ├── app/              # Yönetim arayüzü
│   │   └── components/       # Dashboard bileşenleri
│   └── README.md
│
├── chrome-extension/          # Chrome Eklentisi (Manifest V3)
│   ├── src/
│   │   ├── background/       # Service Worker
│   │   ├── content/          # UYAP Parser
│   │   └── popup/            # React Popup UI
│   └── README.md
│
├── .agents/                   # Agent yönergeleri
├── docs/                      # Dokümantasyon
└── README.md                  # (Bu dosya)
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis (opsiyonel)

### Backend Kurulumu

```bash
# 1. Projeyi klonla
git clone https://github.com/vadi360/Refik.git
cd Refik

# 2. Backend klasörüne gir
cd backend

# 3. Bağımlılıkları yükle
npm install

# 4. Environment dosyası oluştur
cp .env.example .env
# .env dosyasını düzenle

# 5. Veritabanı migration
npx prisma migrate dev

# 6. Seed data (opsiyonel)
npx prisma db seed

# 7. Geliştirme sunucusunu başlat
npm run start:dev
```

### API Docs
```
http://localhost:3000/api/docs  # Swagger
http://localhost:3000/api/health  # Health check
```

---

## 📚 Modüller (21 Adet)

| # | Modül | Açıklama | Endpoints |
|---|-------|----------|-----------|
| 1 | **Auth** | JWT + OTP kimlik doğrulama | 7 |
| 2 | **Users** | Kullanıcı yönetimi | 8 |
| 3 | **Cases** | Dava dosyaları | 10 |
| 4 | **Hearings** | Duruşma takibi | 8 |
| 5 | **Notifications** | Tebligatlar | 12 |
| 6 | **AI** | Minimax + Claude | 10 |
| 7 | **Case Update** | AI dosya güncelleme | 6 |
| 8 | **Delegations** | Tevkil pazarı | 10 |
| 9 | **Documents** | Belge yönetimi | 8 |
| 10 | **User Documents** | Kullanıcı belgeleri | 6 |
| 11 | **UYAP** | UYAP scraping | 6 |
| 12 | **UETS** | UETS entegrasyonu | 6 |
| 13 | **RAG** | Pinecone vektör arama | 5 |
| 14 | **Payments** | Ödeme sistemleri | 8 |
| 15 | **Icra** | İcra takibi | 10 |
| 16 | **Call Center** | Borçlu arama | 6 |
| 17 | **Calendar** | Birleşik takvim | 10 |
| 18 | **Reminders** | Hatırlatıcılar | 8 |
| 19 | **Admin** | Yönetim paneli | 12 |
| 20 | **Cron** | Zamanlı işlemler | - |
| 21 | **Health** | Sağlık kontrolü | 2 |

**Toplam: ~90+ API Endpoint**

---

## 🔐 Güvenlik

| Özellik | Açıklama |
|---------|----------|
| 🔑 **JWT Access Token** | 1 saat geçerli |
| 🔄 **Refresh Token** | 7 gün geçerli |
| 🔐 **OTP** | Telefon doğrulama |
| 📋 **KVKK Uyumlu** | 6698 sayılı KVKK |
| 🔒 **Şifreleme** | TLS 1.3, AES-256 |
| 🛡️ **Rate Limiting** | API koruması |
| 📝 **Audit Log** | Tüm işlemler kayıtları |

---

## 📊 Veritabanı Modelleri (23 Adet)

```
User ─────┬──── Subscription ──── Payment
          ├──── Case ──── Hearing ──── Notification
          ├──── Delegation ──── Complaint
          ├──── Document ──── DocumentEmbedding
          ├──── Reminder ──── NotificationLog
          ├──── AiConfig ──── AiConfigUpdate
          ├──── UserToken
          ├──── UetsSession
          ├──── AuditLog
          ├──── UserDocument
          ├──── IcraFile ──── IcraPayment ──── IcraCallRecord ──── IcraAssetHistory
          └──── NotificationTemplate
```

---

## 🌎 Bildirim Kanalları (5 Kanal)

| Kanal | Servis | Durum |
|-------|--------|-------|
| 🔔 **Push** | Firebase Cloud Messaging | ✅ |
| 📱 **SMS** | NetGSM | ✅ |
| 📧 **Email** | SendGrid | ✅ |
| 💬 **WhatsApp** | Twilio | ✅ |
| ✈️ **Telegram** | Bot API | ✅ |

---

## 📅 Roadmap

```
Q2 2026 (Nisan - Haziran)
├── ✅ Chrome Extension (Manifest V3)
├── ✅ Backend API (21 modül)
└── 🔄 Web Uygulaması (Figma → Code)

Q3 2026 (Temmuz - Eylül)
└── 📱 Mobil Uygulama (React Native)
    ├── iOS
    └── Android

Q4 2026 (Ekim - Aralık)
└── 🎛️ Admin Panel + Enterprise
    ├── Kullanıcı yönetimi
    ├── AI config
    ├── İstatistikler
    ├── B2B API (opsiyonel)
    └── White-label (opsiyonel)
```

**Tüm geliştirmeler 2026 yılında tamamlanacak.**

---

## 🤝 Katkıda Bulunma

```bash
# 1. Fork yap
# 2. Feature branch oluştur
git checkout -b feature/yeni-ozellik

# 3. Commit yap
git commit -m 'feat: yeni özellik eklendi'

# 4. Push yap
git push origin feature/yeni-ozellik

# 5. Pull Request aç
```

---

## 📄 Lisans

**GNU AGPLv3** — Bkz. [LICENSE](LICENSE) dosyası

Açık kaynak, ancak:
- ❌ Ticari satış yasak
- ❌ Üçüncü kişilere dağıtım yasak
- ✅ Kendi sunucusunda kurulum serbest
- ✅ Kendi kullanım için geliştirme serbest
- ✅ Katkıda bulunma beklenir

---

<div align="center">

## 💬 İletişim & Destek

**Web:** [refik.app](https://refik.app)  
**API:** [api.refik.app](https://api.refik.app)  
**Email:** info@refik.app | destek@refik.app  
**GitHub:** [github.com/vadi360/Refik](https://github.com/vadi360/Refik)

---

<p align="center">
  <strong>Vadi360</strong> tarafından 💜 ile geliştirildi
</p>

<p align="center">
  <a href="https://vadi360.com">vadi360.com</a> | 
  <a href="https://github.com/vadi360">GitHub</a> | 
  <a href="https://linkedin.com/company/vadi360">LinkedIn</a>
</p>

</div>