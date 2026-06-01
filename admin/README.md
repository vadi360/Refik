# Refik Admin Panel

<div align="center">

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**Proje:** Refik - Yönetici Paneli  
**GitHub:** https://github.com/vadi360/Refik

*Türkiye'nin Hukuk Asistanı - Yönetim Arayüzü*

---

| Durum | Değer |
|-------|-------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| Auth | JWT + Role-based |
| Charts | Recharts |

</div>

---

## 📋 İçindekiler

1. [Hakkında](#1-hakkında)
2. [Özellikler](#2-özellikler)
3. [Teknoloji Stack](#3-teknoloji-stack)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Sayfalar](#5-sayfalar)
6. [Bileşenler](#6-bileşenler)
7. [API Entegrasyonu](#7-api-entegrasyonu)
8. [Kurulum](#8-kurulum)

---

## 1. Hakkında

Refik Admin Panel, sistem yöneticilerinin ve operasyon ekibinin Refik platformunu yönetmek için kullandığı web tabanlı yönetim arayüzüdür. Kullanıcı yönetimi, AI yapılandırma, içerik moderation ve analitik raporlar sunar.

### Temel Özellikler

- **Kullanıcı Yönetimi** — Avukat kayıtları, onay, ban/suspend
- **AI Yapılandırma** — Görev başına model seçimi
- **İçerik Moderasyon** — Tevkil şikayetleri, puanlama inceleme
- **Analitik Dashboard** — Kullanıcı, gelir, aktiflik raporları
- **Bildirim Gönderme** — Toplu push, SMS, email

---

## 2. Özellikler

### 2.1 Dashboard

| Widget | Açıklama |
|--------|----------|
| Toplam Kullanıcı | Aktif, pasif, beklemede sayıları |
| Yeni Kayıtlar | Bu hafta/ay yeni kayıtlar |
| Gelir Özeti | Aylık gelir, paket dağılımı |
| Aktiflik Grafikleri | Günlük/haftalık aktiflik |
| Sistem Sağlığı | API durumu, sunucu sağlığı |

### 2.2 Kullanıcı Yönetimi

| Özellik | Açıklama |
|---------|----------|
| Kullanıcı Listesi | Arama, filtre, sıralama |
| Kullanıcı Detay | Profil, abonelik, aktivite |
| Onay Bekleyen | Baro verification bekleyenler |
| Ban/Suspend | Kullanıcı engelleme |
| Özlük Dosyası | Belgeleri inceleme |

### 2.3 Paket Yönetimi

| Özellik | Açıklama |
|---------|----------|
| Paket Listesi | 4 paket (Basic-Enterprise) |
| Paket Düzenleme | Fiyat, token limit güncelleme |
| Paket İstatistikleri | Satış, kullanan sayısı |
| Token Paketleri | Ek token paketleri |

### 2.4 AI Yapılandırma

| Özellik | Açıklama |
|---------|----------|
| Görev Listesi | 9 AI görevi listesi |
| Model Seçimi | MINIMAX veya CLAUDE seçimi |
| Kritik Görev | İşaretleme (token limit yoksuz) |
| İstatistikler | Görev başına kullanım |

### 2.5 Şikayet Yönetimi

| Özellik | Açıklama |
|---------|----------|
| Şikayet Listesi | Bekleyen, çözümlenmiş |
| Şikayet Detay | Tevkil bilgisi, taraflar |
| Karar Ver | Onay red, uyarı, ban |
| İstatistikler | Şikayet oranları |

### 2.6 Tevkiller

| Özellik | Açıklama |
|---------|----------|
| Tevkil Listesi | Tüm tevkiller |
| Durum Filtreleme | Beklemede, onaylandı, reddedildi |
| Detay İnceleme | Taraflar, mahkeme, tarih |
| İstatistikler | Tamamlama oranı, süre |

### 2.7 Bildirim Gönderme

| Özellik | Açıklama |
|---------|----------|
| Toplu Bildirim | Tüm kullanıcılara |
| Hedefli Bildirim | Belirli kullanıcı grupları |
| Kanal Seçimi | Push, SMS, Email, WhatsApp, Telegram |
| Şablon Oluşturma | Bildirim şablonları |
| Gönderim Raporu | Başarı/başarısızlık |

### 2.8 Analitik

| Özellik | Açıklama |
|---------|----------|
| Kullanıcı Analitik | Büyüme, retention, demografik |
| Gelir Analitik | Aylık gelir, paket dağılımı |
| AI Kullanımı | Görev başına kullanım |
| Tevkil Analitik | Eşleşme oranı, puan dağılımı |
| Rapor Export | CSV, PDF export |

---

## 3. Teknoloji Stack

### 3.1 Core Teknolojiler

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | Next.js | 14.x |
| Language | TypeScript | 5.3 |
| UI Library | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x |
| Forms | React Hook Form | 7.x |

### 3.2 Ek Kütüphaneler

| Kütüphane | Kullanım |
|-----------|----------|
| @tanstack/react-query | Data fetching |
| zod | Schema validation |
| date-fns | Tarih işlemleri |
| lucide-react | İkonlar |
| radix-ui | Headless UI |
| next-auth | Auth (opsiyonel) |
| recharts | Grafikler |

---

## 4. Klasör Yapısı

```
admin/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                # Auth sayfaları
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx            # Redirect to login
│   │   │
│   │   ├── (dashboard)/           # Dashboard sayfaları
│   │   │   ├── layout.tsx         # Admin layout
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Ana panel
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx   # Kullanıcı listesi
│   │   │   │   ├── detail/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Kullanıcı detay
│   │   │   │   └── approve/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx # Onay sayfası
│   │   │   │
│   │   │   ├── packages/
│   │   │   │   └── page.tsx       # Paket yönetimi
│   │   │   │
│   │   │   ├── ai-config/
│   │   │   │   ├── page.tsx       # AI config list
│   │   │   │   └── [taskType]/
│   │   │   │       └── page.tsx   # Task config detay
│   │   │   │
│   │   │   ├── complaints/
│   │   │   │   ├── page.tsx       # Şikayet listesi
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Şikayet detay
│   │   │   │
│   │   │   ├── delegations/
│   │   │   │   └── page.tsx       # Tevkiller
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── page.tsx       # Bildirim listesi
│   │   │   │   └── send/
│   │   │   │       └── page.tsx   # Bildirim gönder
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx       # Genel analitik
│   │   │   │   └── export/
│   │   │   │       └── page.tsx   # Rapor export
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx       # Ayarlar
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global CSS
│   │
│   ├── components/                # Paylaşılan bileşenler
│   │   ├── ui/                    # Base UI
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   └── spinner.tsx
│   │   │
│   │   ├── layout/                # Layout
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── admin-layout.tsx
│   │   │
│   │   └── features/              # Feature bileşenleri
│   │       ├── dashboard/
│   │       │   ├── stats-card.tsx
│   │       │   ├── stats-chart.tsx
│   │       │   └── activity-feed.tsx
│   │       ├── users/
│   │       │   ├── user-table.tsx
│   │       │   ├── user-detail.tsx
│   │       │   └── user-actions.tsx
│   │       ├── packages/
│   │       │   ├── package-list.tsx
│   │       │   └── package-form.tsx
│   │       ├── ai-config/
│   │       │   ├── task-list.tsx
│   │       │   └── task-form.tsx
│   │       ├── complaints/
│   │       │   ├── complaint-list.tsx
│   │       │   └── complaint-detail.tsx
│   │       ├── notifications/
│   │       │   ├── notification-form.tsx
│   │       │   └── notification-list.tsx
│   │       └── analytics/
│   │           ├── revenue-chart.tsx
│   │           ├── user-chart.tsx
│   │           └── export-button.tsx
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── usePackages.ts
│   │   ├── useAIConfig.ts
│   │   ├── useComplaints.ts
│   │   └── useAnalytics.ts
│   │
│   ├── services/                  # API servisleri
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── packages.service.ts
│   │   ├── ai-config.service.ts
│   │   ├── complaints.service.ts
│   │   ├── notifications.service.ts
│   │   └── analytics.service.ts
│   │
│   ├── store/                    # State management
│   │   ├── auth.store.ts
│   │   └── ui.store.ts
│   │
│   ├── utils/                    # Yardımcılar
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── helpers.ts
│   │
│   └── types/                    # TypeScript tipleri
│       ├── user.types.ts
│       ├── package.types.ts
│       ├── ai.types.ts
│       ├── complaint.types.ts
│       └── index.ts
│
├── public/
│   ├── favicon.ico
│   └── og-image.jpg
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md                     # (bu dosya)
```

---

## 5. Sayfalar

### 5.1 Auth Sayfaları

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/admin/login` | LoginPage | Admin girişi |

### 5.2 Dashboard Sayfaları

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/admin/dashboard` | DashboardPage | İstatistikler, grafikler |
| `/admin/users` | UsersPage | Kullanıcı listesi |
| `/admin/users/:id` | UserDetailPage | Kullanıcı detay |
| `/admin/users/approve/:id` | ApproveUserPage | Baro onayı |
| `/admin/packages` | PackagesPage | Paket yönetimi |
| `/admin/ai-config` | AiConfigPage | AI görev listesi |
| `/admin/ai-config/:task` | AiConfigDetailPage | Görev yapılandırma |
| `/admin/complaints` | ComplaintsPage | Şikayetler |
| `/admin/complaints/:id` | ComplaintDetailPage | Şikayet detay |
| `/admin/delegations` | DelegationsPage | Tevkiller |
| `/admin/notifications` | NotificationsPage | Bildirim geçmişi |
| `/admin/notifications/send` | SendNotificationPage | Bildirim gönder |
| `/admin/analytics` | AnalyticsPage | Analitik |
| `/admin/analytics/export` | ExportPage | Rapor export |
| `/admin/settings` | SettingsPage | Sistem ayarları |

---

## 6. Bileşenler

### 6.1 UI Bileşenleri

```
components/ui/
├── button.tsx        # Admin action buttons
├── input.tsx         # Form inputs
├── select.tsx        # Dropdowns
├── modal.tsx         # Confirmation modals
├── table.tsx         # Data tables with pagination
├── badge.tsx         # Status badges
├── card.tsx          # Dashboard cards
├── spinner.tsx       # Loading states
└── toast.tsx         # Notifications
```

### 6.2 Dashboard Bileşenleri

```
components/features/dashboard/
├── stats-card.tsx       # Statistic card
├── stats-chart.tsx      # Line/bar chart
├── activity-feed.tsx    # Recent activity
└── quick-actions.tsx     # Quick action buttons
```

### 6.3 Kullanıcı Bileşenleri

```
components/features/users/
├── user-table.tsx        # User data table
├── user-detail.tsx       # User profile view
├── user-actions.tsx      # Ban, suspend, approve
└── documents-view.tsx    # Özlük dosyası viewer
```

---

## 7. API Entegrasyonu

### 7.1 Admin API Endpoints

| Servis | Endpoint | Açıklama |
|--------|----------|----------|
| `usersService` | GET /admin/users | Kullanıcı listesi |
| `usersService` | GET /admin/users/:id | Kullanıcı detay |
| `usersService` | PUT /admin/users/:id | Güncelle/ban |
| `packagesService` | GET /admin/packages | Paketler |
| `packagesService` | PUT /admin/packages/:id | Paket güncelle |
| `aiConfigService` | GET /admin/ai-config | AI görevleri |
| `aiConfigService` | PUT /admin/ai-config/:task | Model seçimi |
| `complaintsService` | GET /admin/complaints | Şikayetler |
| `complaintsService` | PUT /admin/complaints/:id | Karar ver |
| `analyticsService` | GET /admin/stats | İstatistikler |
| `analyticsService` | GET /admin/analytics/users | Kullanıcı analitik |
| `analyticsService` | GET /admin/analytics/revenue | Gelir analitik |

### 7.2 Raporlama

```typescript
// Export to CSV/PDF
const exportReport = async (type: 'users' | 'revenue' | 'complaints') => {
  const data = await analyticsService.getReport(type);
  // Convert to CSV/PDF
};
```

---

## 8. Kurulum

### 8.1 Gereksinimler

- Node.js 18+
- npm veya yarn

### 8.2 Kurulum Adımları

```bash
# 1. Projeye git
cd Refik/admin

# 2. Bağımlılıkları yükle
npm install

# 3. Environment oluştur
cp .env.example .env.local
# .env.local düzenle

# 4. Geliştirme sunucusu başlat
npm run dev
```

---

<div align="center">

*Refik Admin Panel*

*© 2026 Refik. Tüm hakları saklıdır.*

</div>