<p align="center">
  <img src="https://refik.app/banner.png" alt="Refik Banner" width="100%" />
</p>

<div align="center">

# Refik Web Uygulaması

*Mobil öncelikli, AI destekli hukuk asistanı - Web Arayüzü*

[![Next.js](https://img.shields.io/badge/nextjs-14-000000?style=flat-square&logo=Next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=React)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-3178C6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/tailwindcss-3-06B6D4?style=flat-square&logo=TailwindCSS&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-4B0082?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

| 🟡 | **Versiyon** | 1.0.0 (Planlanıyor) |
|---|-------------|----------------------|
| 🟡 | **Framework** | Next.js 14 (App Router) |
| 🟡 | **Language** | TypeScript 5.3 |
| 🟡 | **UI** | Tailwind CSS |
| 🟡 | **State** | Zustand / Redux Toolkit |
| 🟡 | **PWA** | ✅ Evet |

**Backend:** [api.refik.app](https://api.refik.app) | **Ana Proje:** [Refik](../README.md)

</div>

---

## 🎯 Ne İşe Yarar?

<p align="center">
  <img src="https://img.shields.io/badge/📱-Responsive-10B981?style=for-the-badge" alt="Responsive" />
  <img src="https://img.shields.io/badge/💻-Masaüstü%20Desteği-3B82F6?style=for-the-badge" alt="Desktop" />
  <img src="https://img.shields.io/badge/🔔-Push%20Bildirim-8B5CF6?style=for-the-badge" alt="Push" />
  <img src="https://img.shields.io/badge/📴-Offline%20Desteği-F59E0B?style=for-the-badge" alt="Offline" />
</p>

> Avukatların masaüstü veya dizüstü bilgisayardan kullanabileceği **responsive web arayüzü**. PWA özellikleri ile native uygulama deneyimi.

---

## ✨ Özellikler

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| 📱 **Responsive** | Mobil, tablet, masaüstü uyumlu | 🔄 |
| 💾 **Offline** | Service Worker ile çevrimdışı çalışma | 🔄 |
| 🔔 **Push Bildirim** | Tarayıcı bildirimleri | 🔄 |
| 🔐 **JWT + OTP** | Güvenli kimlik doğrulama | 🔄 |
| 📊 **Dashboard** | İstatistikler, yaklaşan duruşmalar | 🔄 |
| 📋 **Dava Yönetimi** | CRUD, filtreleme, arama | 🔄 |
| 📅 **Takvim** | Duruşma ve hatırlatıcı takvimi | 🔄 |
| 🔍 **UYAP** | Dosya takibi, AI özetleme | 🔄 |
| ⚖️ **Tevkil** | Tevkil pazarı, başvuru yönetimi | 🔄 |
| 📄 **Belgeler** | RAG arama, belge yükleme | 🔄 |
| 💳 **Ödemeler** | Abonelik, token paketleri | 🔄 |
| ⚙️ **Ayarlar** | Profil, bildirim tercihleri | 🔄 |

---

## 🏗️ Teknoloji Stack

<div align="left">

![Next.js](https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white)
![Zustand](https://img.shields.io/badge/-Zustand-F59E0B?style=for-the-badge&logo=Zustand&logoColor=white)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=ReactQuery&logoColor=white)
![NextAuth](https://img.shields.io/badge/-NextAuth-000000?style=for-the-badge&logo=NextAuth&logoColor=white)

</div>

---

## 📁 Klasör Yapısı

```
web/
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # PWA ikonları
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Auth sayfaları
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/   # Dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── cases/
│   │   │   ├── calendar/
│   │   │   ├── notifications/
│   │   │   ├── delegations/
│   │   │   ├── documents/
│   │   │   ├── payments/
│   │   │   └── settings/
│   │   │
│   │   ├── api/            # API routes (serverless)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/            # Base UI components
│   │   ├── forms/         # Form bileşenleri
│   │   ├── layouts/       # Layout bileşenleri
│   │   └── features/      # Feature bileşenleri
│   │
│   ├── lib/
│   │   ├── api/           # API client
│   │   ├── auth/          # Auth utilities
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Helpers
│   │
│   ├── stores/            # Zustand stores
│   └── types/             # TypeScript types
│
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 📱 Ekranlar

| Ekran | Route | Açıklama |
|-------|-------|----------|
| 🏠 **Landing** | `/` | Tanıtım sayfası |
| 🔐 **Login** | `/login` | Telefon + OTP giriş |
| 📝 **Register** | `/register` | Yeni kayıt |
| 📊 **Dashboard** | `/dashboard` | Ana panel, istatistikler |
| 📋 **Davalarım** | `/cases` | Dava listesi, filtreleme |
| 📁 **Dava Detay** | `/cases/:id` | Dosya detay, AI özet |
| 📅 **Takvim** | `/calendar` | Birleşik takvim |
| 🔔 **Bildirimler** | `/notifications` | Tebligatlar, hatırlatıcılar |
| ⚖️ **Tevkil** | `/delegations` | Tevkil pazarı |
| 📄 **Belgeler** | `/documents` | RAG arama, yükleme |
| 💳 **Ödemeler** | `/payments` | Abonelik, token |
| ⚙️ **Ayarlar** | `/settings` | Profil, bildirimler |

---

## 🎨 Tasarım Sistemi

### Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| 🟦 Primary | `#3B82F6` | Butonlar, linkler |
| 🟩 Success | `#10B981` | Başarılı işlemler |
| 🟨 Warning | `#F59E0B` | Uyarılar |
| 🟥 Error | `#EF4444` | Hatalar |
| ⬛ Dark | `#1F2937` | Metin, arka plan |
| ⬜ Light | `#F9FAFB` | Arka plan |

### Typography

| Element | Font | Size |
|---------|------|------|
| H1 | Inter Bold | 32px |
| H2 | Inter Semibold | 24px |
| H3 | Inter Medium | 20px |
| Body | Inter Regular | 16px |
| Small | Inter Regular | 14px |

---

## 🔧 Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Environment dosyası
cp .env.example .env.local

# Environment değişkenleri:
# NEXT_PUBLIC_API_URL=https://api.refik.app/api/v1
# NEXT_PUBLIC_APP_URL=https://refik.app

# 3. Geliştirme sunucusu
npm run dev

# 4. Production build
npm run build
npm start
```

### Docker

```bash
# Build
docker build -t refik-web .

# Run
docker run -p 3000:3000 refik-web
```

---

## 🔐 API Entegrasyonu

### Endpoint'ler

```typescript
// API client
import { refikApi } from '@/lib/api';

// Auth
refikApi.post('/auth/login', { phone, password })
refikApi.post('/auth/verify-otp', { phone, code })

// Cases
refikApi.get('/cases')
refikApi.get('/cases/:id')
refikApi.post('/cases')
refikApi.put('/cases/:id')

// Notifications
refikApi.get('/notifications')
refikApi.post('/notifications/read')

// AI
refikApi.post('/ai/case-update', { caseId, newContent })
```

---

## PWA Yapılandırması

### manifest.json

```json
{
  "name": "Refik",
  "short_name": "Refik",
  "description": "AI destekli hukuk asistanı",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 📄 Lisans

**MIT License** - Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

---

<div align="center">

**Vadi360** tarafından 💜 ile geliştirildi

[refik.app](https://refik.app) | [github.com/vadi360](https://github.com/vadi360)

</div>