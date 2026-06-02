<p align="center">
  <img src="https://refik.app/banner.png" alt="Refik Banner" width="100%" />
</p>

<div align="center">

# Refik Admin Panel

*Yönetim Arayüzü - Kullanıcı, AI ve İçerik Yönetimi*

[![Next.js](https://img.shields.io/badge/nextjs-14-000000?style=flat-square&logo=Next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-3178C6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=React)](https://reactjs.org)
[![Tailwind](https://img.shields.io/badge/tailwindcss-3-06B6D4?style=flat-square&logo=TailwindCSS&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

| 🟡 | **Versiyon** | 1.0.0 (Planlanıyor) |
|---|-------------|----------------------|
| 🟡 | **Framework** | Next.js 14 (App Router) |
| 🟡 | **Language** | TypeScript 5.3 |
| 🟡 | **UI** | Tailwind CSS + shadcn/ui |
| 🟡 | **Charts** | Recharts |
| 🟡 | **Auth** | JWT + Role-based |

**Backend:** [api.refik.app](https://api.refik.app) | **Ana Proje:** [Refik](../README.md)

</div>

---

## 🎯 Ne İşe Yarar?

<p align="center">
  <img src="https://img.shields.io/badge/👥-Kullanıcı%20Yönetimi-10B981?style=for-the-badge" alt="Users" />
  <img src="https://img.shields.io/badge/🤖-AI%20Config-3B82F6?style=for-the-badge" alt="AI" />
  <img src="https://img.shields.io/badge/📊-Analitik-8B5CF6?style=for-the-badge" alt="Analytics" />
  <img src="https://img.shields.io/badge/📝-Moderasyon-F59E0B?style=for-the-badge" alt="Moderation" />
</p>

> Sistem yöneticileri ve operasyon ekibinin **Refik platformunu yönetmek** için kullandığı arayüz. Kullanıcı yönetimi, AI yapılandırma, içerik moderasyonu ve analitik raporlar.

---

## ✨ Özellikler

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| 👥 **Kullanıcı Yönetimi** | Avukat kayıtları, onay, ban/suspend | 🔄 |
| 🤖 **AI Yapılandırma** | Görev başına model seçimi | 🔄 |
| 📊 **Analitik Dashboard** | Kullanıcı, gelir, aktiflik | 🔄 |
| 📝 **İçerik Moderasyon** | Tevkil şikayetleri, puanlama | 🔄 |
| 🔔 **Bildirim Gönderme** | Toplu push, SMS, email | 🔄 |
| 💳 **Ödeme Yönetimi** | Abonelikler, iadeler | 🔄 |
| ⚙️ **Sistem Ayarları** | Uygulama konfigürasyonu | 🔄 |
| 📋 **Audit Log** | Tüm işlemlerin kaydı | 🔄 |
| 🏥 **Health Monitor** | Sistem sağlık kontrolü | 🔄 |
| 📧 **Şablon Yönetimi** | Email, SMS şablonları | 🔄 |

---

## 🏗️ Teknoloji Stack

<div align="left">

![Next.js](https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/-shadcn%20ui-000000?style=for-the-badge&logo=shadcn&logoColor=white)
![Recharts](https://img.shields.io/badge/-Recharts-FF6B6B?style=for-the-badge&logo=Recharts&logoColor=white)
![NextAuth](https://img.shields.io/badge/-NextAuth-000000?style=for-the-badge&logo=NextAuth&logoColor=white)

</div>

---

## 📁 Klasör Yapısı

```
admin/
├── public/
│   └── icons/
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/        # Auth sayfaları
│   │   │   ├── login/
│   │   │   └── logout/
│   │   │
│   │   ├── (dashboard)/   # Dashboard routes
│   │   │   ├── _layout.tsx
│   │   │   ├── dashboard/  # Ana panel
│   │   │   ├── users/      # Kullanıcılar
│   │   │   ├── cases/      # Dava/İçerik
│   │   │   ├── ai/         # AI config
│   │   │   ├── payments/   # Ödemeler
│   │   │   ├── notifications/
│   │   │   ├── delegations/ # Tevkil moderasyon
│   │   │   ├── audit/      # Audit log
│   │   │   ├── settings/   # Sistem ayarları
│   │   │   └── health/     # Health monitor
│   │   │
│   │   ├── api/           # Admin API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/           # Base UI (shadcn/ui)
│   │   ├── layouts/      # Admin layouts
│   │   ├── charts/       # Recharts bileşenleri
│   │   └── features/     # Feature bileşenleri
│   │
│   ├── lib/
│   │   ├── api.ts       # Admin API client
│   │   ├── auth.ts      # Auth utilities
│   │   └── utils.ts     # Helpers
│   │
│   └── types/            # TypeScript types
│
├── tailwind.config.ts
└── package.json
```

---

## 📊 Dashboard Paneli

### Ana Metrikler

| Metric | Açıklama |
|--------|----------|
| 👥 **Toplam Kullanıcı** | Kayıtlı avukat sayısı |
| 📋 **Aktif Dosyalar** | Takip edilen dava sayısı |
| 💰 **Aylık Gelir** | MRR (Monthly Recurring Revenue) |
| 📅 **Bu Ay Dönüşüm** | Yeni abonelikler |
| 🔔 **5 Gün Kuralı** | Bekleyen tebligat sayısı |
| ⚖️ **Aktif Tevkiller** | Açık tevkil başvuruları |

### Grafikler

| Grafik | Tip | Veri |
|--------|-----|------|
| Kullanıcı Büyümesi | Line | Aylık yeni kayıtlar |
| Gelir | Area | MRR trend |
| AI Kullanımı | Bar | Görev bazlı token |
| Paket Dağılımı | Pie | Basic/Standard/Pro/Enterprise |
| Aktiflik | Heatmap | Günlük aktif kullanıcılar |

---

## 👥 Kullanıcı Yönetimi

| Özellik | Açıklama |
|---------|----------|
| **Liste** | Filtreleme, arama, sayfalama |
| **Detay** | Tüm bilgiler, aktivite logu |
| **Onay** | Baro doğrulama, özlük dosyası |
| **Ban/Suspend** | Geçici veya kalıcı engelleme |
| **Rol Değiştir** | User → Admin |

### Kullanıcı Durumları

| Durum | Renk | Açıklama |
|-------|------|----------|
| 🟡 **Beklemede** | Yellow | Baro onayı bekliyor |
| 🟢 **Aktif** | Green | Tam erişim |
| 🔴 **Askıda** | Red | Banlı veya süresi dolmuş |
| ⬜ **Pasif** | Gray | Hiç giriş yapmamış |

---

## 🤖 AI Yapılandırma

### Görev Bazlı Model Seçimi

| Görev | Varsayılan Model | Alternatif |
|-------|-------------------|------------|
| `notification_summary` | MINIMAX | - |
| `deadline_extract` | CLAUDE | - |
| `case_summary` | MINIMAX | CLAUDE |
| `document_generate` | MINIMAX | CLAUDE |
| `legal_research` | CLAUDE | - |

### Model Değiştirme

```typescript
// AI görev modelini değiştir
PUT /admin/ai-config
{
  "taskType": "case_summary",
  "aiModel": "CLAUDE",
  "tokenLimit": 5000
}
```

---

## 🔧 Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Environment dosyası
cp .env.example .env.local

# Environment değişkenleri:
# ADMIN_API_URL=https://api.refik.app/api/v1/admin
# ADMIN_JWT_SECRET=your-secret
# NEXT_PUBLIC_APP_URL=https://admin.refik.app

# 3. Geliştirme sunucusu
npm run dev

# 4. Production
npm run build
npm start
```

---

## 🔐 Adminrolleri

| Rol | İzinler |
|-----|---------|
| **Super Admin** | Tüm işlemler, sistem ayarları |
| **Admin** | Kullanıcı yönetimi, AI config |
| **Moderator** | İçerik moderasyonu, şikayetler |
| **Support** | Sadece görüntüleme, kullanıcı desteği |

---

## 📡 API Entegrasyonu

### Admin Endpoints

```typescript
// Admin API client
import { adminApi } from '@/lib/api';

// Kullanıcılar
adminApi.get('/users')
adminApi.put('/users/:id/approve')
adminApi.put('/users/:id/ban')

// AI Config
adminApi.get('/ai-config')
adminApi.put('/ai-config/:taskType')

// Payments
adminApi.get('/payments')
adminApi.post('/payments/:id/refund')

// Notifications
adminApi.post('/notifications/broadcast')
```

---

## 📄 Lisans

**MIT License** - Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

---

<div align="center">

**Vadi360** tarafından 💜 ile geliştirildi

[refik.app](https://refik.app) | [github.com/vadi360](https://github.com/vadi360)

</div>