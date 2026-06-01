# AvukatPro Web Uygulaması

<div align="center">

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**Proje:** AvukatPro - Web Uygulaması (PWA)  
**GitHub:** https://github.com/vadi360/AvukatPro

*Mobil öncelikli, AI destekli hukuk asistanı - Web Arayüzü*

---

| Durum | Değer |
|-------|-------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| State | Zustand / Redux Toolkit |
| PWA | ✅ Evet |

</div>

---

## 📋 İçindekiler

1. [Hakkında](#1-hakkında)
2. [Özellikler](#2-özellikler)
3. [Teknoloji Stack](#3-teknoloji-stack)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Sayfalar & Route'lar](#5-sayfalar--routelar)
6. [Bileşenler](#6-bileşenler)
7. [API Entegrasyonu](#7-api-entegrasyonu)
8. [State Management](#8-state-management)
9. [PWA Yapılandırması](#9-pwa-yapılandırması)
10. [Kurulum](#10-kurulum)
11. [Geliştirme](#11-geliştirme)
12. [Üretim](#12-üretim)

---

## 1. Hakkında

AvukatPro Web Uygulaması, avukatların masaüstü veya dizüstü bilgisayardan kullanabileceği responsive web arayüzüdür. Next.js 14 ile geliştirilmiş, PWA (Progressive Web App) özellikleri desteklemektedir.

### Temel Özellikler

- **Responsive Tasarım** — Mobil, tablet ve masaüstü uyumlu
- **PWA Desteği** — Ana ekrana ekle, çevrimdışı çalışma
- **Türkçe Arayüz** — %100 Türkçe kullanıcı deneyimi
- **AI Entegrasyonu** — Dilekçe üretimi, emsal araştırma
- **Gerçek Zamanlı** — WebSocket veya SSE ile anlık bildirimler

---

## 2. Özellikler

### 2.1 Kimlik Doğrulama

| Özellik | Açıklama |
|---------|----------|
| Telefon ile Kayıt | OTP doğrulamalı kayıt |
| Şifre ile Giriş | Email + şifre girişi |
| OTP Doğrulama | SMS ile 6 haneli kod |
| Şifremi Unuttum | Email/sms ile sıfırlama |
| Oturum Yönetimi | JWT token, refresh mekanizması |

### 2.2 Dashboard (Ana Panel)

| Widget | Açıklama |
|--------|----------|
| Yaklaşan Duruşmalar | Bu hafta/ay duruşma listesi |
| Süre Uyarıları | Kritik süre takibi |
| Son Tebligatlar | UETS'ten gelen son tebligatlar |
| Aktif Tevkiller | Bekleyen/onaylanan tevkiller |
| AI Asistan | Hızlı sorgu kutusu |

### 2.3 Dava Yönetimi

| Özellik | Açıklama |
|---------|----------|
| Dava Listesi | Filtreleme, arama, sıralama |
| Dava Detay | Taraflar, duruşmalar, belgeler |
| Yeni Dava | Form ile dava oluşturma |
| Duruşma Takibi | Takvim görünümü |
| Dosya Yükleme | PDF, Word belgeleri |

### 2.4 Tebligat Yönetimi (UETS)

| Özellik | Açıklama |
|---------|----------|
| Tebligat Listesi | Okundu/bekleyen filtreleme |
| AI Özet | notification_summary ile özet |
| Süre Çıkarımı | deadline_extract ile süre tespiti |
| Dava Bağlama | Tebligatı davaya bağlama |
| 5 Gün Kuralı | Açılmamış tebligat takibi |

### 2.5 Tevkil Pazarı

| Özellik | Açıklama |
|---------|----------|
| Tevkil Oluştur | Duruşma için tevkil talebi |
| Avukat Bul | Konum, uzmanlık, puan ile arama |
| Tevkil Onaylama | Gelen tevkil isteklerini onaylama/reddetme |
| Değerlendirme | 5 yıldız puanlama sistemi |
| Şikayet | Tevkil ile ilgili şikayet oluşturma |

### 2.6 AI Asistan

| Özellik | Açıklama |
|---------|----------|
| Sohbet Arayüzü | Genel soru-cevap |
| Dilekçe Üretici | Belge türü seçimi ile üretim |
| Emsal Araştırma | RAG destekli içtihat arama |
| Karar Analizi | Mahkeme kararı lehte/aleyhte analiz |
| İhtarname | Hukuki ihtarname üretimi |

### 2.7 Takvim

| Özellik | Açıklama |
|---------|----------|
| Birleşik Görünüm | Duruşmalar, hatırlatıcılar, tebligatlar |
| Gün/Hafta/Ay | Farklı zaman görünümleri |
| Renk Kodlaması | Dava türüne göre renkler |
| Hatırlatıcı | Bildirim ayarları |
| Export | ICS formatında dışa aktarma |

### 2.8 İcra Takibi

| Özellik | Açıklama |
|---------|----------|
| İcra Dosyaları | Toplu takip listesi |
| Durum Takibi | Ödeme, satış, durdurma |
| Mal Varlığı | AI destekli tespit |
| Arama Kayıtları | Call center entegrasyonu |

### 2.9 Profil & Ayarlar

| Özellik | Açıklama |
|---------|----------|
| Profil Bilgileri | Ad, soyad, baro bilgisi |
| Bildirim Tercihleri | Push, SMS, Email, WhatsApp, Telegram |
| Abonelik | Paket bilgisi, token kullanımı |
| Özlük Dosyası | Baro verification belgeleri |

---

## 3. Teknoloji Stack

### 3.1 Core Teknolojiler

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | Next.js | 14.x |
| Language | TypeScript | 5.3 |
| UI Library | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| State | Zustand | 4.x |

### 3.2 Ek Kütüphaneler

| Kütüphane | Kullanım |
|-----------|----------|
| React Query | Server state management |
| React Hook Form | Form yönetimi |
| Zod | Schema validation |
| date-fns | Tarih işlemleri |
| Lucide React | İkonlar |
| Radix UI | Headless UI bileşenleri |
| Recharts | Grafikler |
| FullCalendar | Takvim görünümü |
| React Hot Toast | Bildirimler |
| Next Auth | Kimlik doğrulama (opsiyonel) |

### 3.3 DevTools

| Araç | Kullanım |
|------|----------|
| ESLint | Kod linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| lint-staged | Stage linting |

---

## 4. Klasör Yapısı

```
web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                # Auth sayfaları (route gruplama)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   │   │   └── steps/          # Kayıt adımları
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (app)/                  # Ana uygulama sayfaları
│   │   │   ├── layout.tsx          # App layout (sidebar, header)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Ana panel
│   │   │   │
│   │   │   ├── cases/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx   # Dava listesi
│   │   │   │   ├── detail/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Dava detay
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Yeni dava
│   │   │   │   └── page.tsx       # Dava ana (redirect)
│   │   │   │
│   │   │   ├── hearings/
│   │   │   │   └── page.tsx       # Duruşmalar
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx   # Tebligat listesi
│   │   │   │   ├── detail/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Tebligat detay
│   │   │   │   └── page.tsx       # Ana sayfa
│   │   │   │
│   │   │   ├── delegations/
│   │   │   │   ├── sent/          # Gönderilen tevkiller
│   │   │   │   ├── received/     # Alınan tevkiller
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx   # Yeni tevkil
│   │   │   │   └── page.tsx       # Tevkil ana
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx       # Birleşik takvim
│   │   │   │
│   │   │   ├── icra/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx   # İcra listesi
│   │   │   │   ├── detail/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── chat/
│   │   │   │   │   └── page.tsx   # AI Sohbet
│   │   │   │   ├── document-generator/
│   │   │   │   │   └── page.tsx   # Dilekçe üretici
│   │   │   │   └── research/
│   │   │   │       └── page.tsx   # Emsal araştırma
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── uets/
│   │   │       └── page.tsx       # UETS bağlantısı
│   │   │
│   │   ├── (admin)/               # Admin panel sayfaları
│   │   │   ├── layout.tsx         # Admin layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── detail/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── approve/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   ├── packages/
│   │   │   │   └── page.tsx
│   │   │   ├── ai-config/
│   │   │   │   ├── page.tsx        # AI config list
│   │   │   │   └── [taskType]/
│   │   │   │       └── page.tsx   # Task config detay
│   │   │   ├── complaints/
│   │   │   │   └── page.tsx
│   │   │   ├── delegations/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (landing)/              # Landing page
│   │   │   └── page.tsx           # Ana sayfa (açılış)
│   │   │
│   │   ├── api/                    # API Routes (Next.js)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── iyzico/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global stiller
│   │
│   ├── components/                # Paylaşılan bileşenler
│   │   ├── ui/                    # Base UI bileşenleri
│   │   │   ├── button.tsx         # Buton
│   │   │   ├── input.tsx          # Input
│   │   │   ├── select.tsx         # Select
│   │   │   ├── modal.tsx          # Modal
│   │   │   ├── dropdown.tsx       # Dropdown
│   │   │   ├── toast.tsx          # Toast bildirim
│   │   │   ├── badge.tsx          # Badge/Tag
│   │   │   ├── card.tsx           # Card
│   │   │   ├── table.tsx          # Table
│   │   │   ├── avatar.tsx         # Avatar
│   │   │   ├── skeleton.tsx       # Loading skeleton
│   │   │   └── spinner.tsx        # Loading spinner
│   │   │
│   │   ├── layout/                # Layout bileşenleri
│   │   │   ├── sidebar.tsx        # Sidebar
│   │   │   ├── header.tsx         # Header
│   │   │   ├── footer.tsx         # Footer
│   │   │   ├── mobile-nav.tsx     # Mobil navigasyon
│   │   │   └── app-layout.tsx     # App layout wrapper
│   │   │
│   │   ├── forms/                 # Form bileşenleri
│   │   │   ├── case-form.tsx      # Dava formu
│   │   │   ├── delegation-form.tsx # Tevkil formu
│   │   │   ├── search-form.tsx    # Arama formu
│   │   │   └── filters.tsx        # Filtre bileşenleri
│   │   │
│   │   ├── features/              # Özellik bileşenleri
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-card.tsx
│   │   │   │   ├── upcoming-hearings.tsx
│   │   │   │   ├── recent-notifications.tsx
│   │   │   │   └── ai-quick-chat.tsx
│   │   │   ├── cases/
│   │   │   │   ├── case-card.tsx
│   │   │   │   ├── case-list.tsx
│   │   │   │   └── case-detail.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── notification-card.tsx
│   │   │   │   └── notification-list.tsx
│   │   │   ├── delegations/
│   │   │   │   ├── delegation-card.tsx
│   │   │   │   ├── lawyer-card.tsx
│   │   │   │   └── rating-modal.tsx
│   │   │   ├── ai/
│   │   │   │   ├── chat-window.tsx
│   │   │   │   ├── document-generator.tsx
│   │   │   │   └── research-results.tsx
│   │   │   ├── calendar/
│   │   │   │   ├── calendar-view.tsx
│   │   │   │   ├── event-modal.tsx
│   │   │   │   └── calendar-filter.tsx
│   │   │   └── icra/
│   │   │       ├── icra-card.tsx
│   │   │       └── payment-tracking.tsx
│   │   │
│   │   └── shared/                # Paylaşılan bileşenler
│   │       ├── loading.tsx
│   │       ├── error-boundary.tsx
│   │       ├── empty-state.tsx
│   │       └── page-header.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Auth hook
│   │   ├── useCases.ts            # Dava hook'ları
│   │   ├── useNotifications.ts    # Tebligat hook'ları
│   │   ├── useDelegations.ts      # Tevkil hook'ları
│   │   ├── useAI.ts               # AI hook'ları
│   │   ├── useCalendar.ts         # Takvim hook'ları
│   │   ├── useToast.ts            # Toast hook
│   │   └── useMediaQuery.ts       # Media query hook
│   │
│   ├── services/                  # API servisleri
│   │   ├── api.ts                 # Axios instance
│   │   ├── auth.service.ts        # Auth API
│   │   ├── cases.service.ts        # Dava API
│   │   ├── notifications.service.ts # Tebligat API
│   │   ├── delegations.service.ts  # Tevkil API
│   │   ├── ai.service.ts          # AI API
│   │   ├── calendar.service.ts    # Takvim API
│   │   ├── icra.service.ts        # İcra API
│   │   └── upload.service.ts      # Dosya yükleme API
│   │
│   ├── store/                    # State management
│   │   ├── auth.store.ts          # Auth state
│   │   ├── cases.store.ts         # Dava state
│   │   ├── notifications.store.ts  # Tebligat state
│   │   ├── ui.store.ts            # UI state
│   │   └── store.ts               # Store root
│   │
│   ├── utils/                     # Yardımcı fonksiyonlar
│   │   ├── date.ts                # Tarih yardımcıları
│   │   ├── format.ts              # Format yardımcıları
│   │   ├── validation.ts          # Validasyon yardımcıları
│   │   ├── constants.ts           # Sabitler
│   │   └── helpers.ts             # Genel yardımcılar
│   │
│   ├── types/                    # TypeScript tipleri
│   │   ├── auth.types.ts          # Auth tipleri
│   │   ├── case.types.ts          # Dava tipleri
│   │   ├── notification.types.ts  # Tebligat tipleri
│   │   ├── delegation.types.ts    # Tevkil tipleri
│   │   ├── ai.types.ts            # AI tipleri
│   │   ├── api.types.ts           # Genel API tipleri
│   │   └── index.ts              # Tipler index
│   │
│   └── styles/                   # Global stiller
│       ├── globals.css           # Global CSS
│       ├── variables.css          # CSS değişkenleri
│       └── components/           # Bileşen stilleri
│
├── public/                       # Statik dosyalar
│   ├── icons/                    # PWA ikonları
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── apple-touch-icon.png
│   │   └── favicon.ico
│   ├── images/                   # Görseller
│   │   ├── logo.svg
│   │   └── og-image.jpg
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── robots.txt
│
├── .env.local                    # Environment (local)
├── .env.example                  # Environment şablonu
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json
└── README.md                     # (bu dosya)
```

---

## 5. Sayfalar & Route'lar

### 5.1 Auth Sayfaları

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/login` | LoginPage | Email + şifre girişi |
| `/register` | RegisterPage | Adım adım kayıt |
| `/register/phone` | PhoneStep | Telefon doğrulama |
| `/register/otp` | OtpStep | OTP girişi |
| `/register/info` | InfoStep | Kişisel bilgiler |
| `/register/baro` | BaroStep | Baro seçimi |
| `/forgot-password` | ForgotPasswordPage | Şifre sıfırlama |

### 5.2 App Sayfaları

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/dashboard` | DashboardPage | Ana panel |
| `/cases` | CasesPage | Dava listesi |
| `/cases/:id` | CaseDetailPage | Dava detay |
| `/cases/new` | NewCasePage | Yeni dava |
| `/hearings` | HearingsPage | Duruşmalar |
| `/notifications` | NotificationsPage | Tebligatlar |
| `/notifications/:id` | NotificationDetailPage | Tebligat detay |
| `/delegations` | DelegationsPage | Tevkiller |
| `/delegations/new` | NewDelegationPage | Yeni tevkil |
| `/delegations/sent` | SentDelegationsPage | Gönderilenler |
| `/delegations/received` | ReceivedDelegationsPage | Alınanlar |
| `/documents` | DocumentsPage | Belgeler |
| `/documents/new` | NewDocumentPage | Yeni belge |
| `/calendar` | CalendarPage | Takvim |
| `/icra` | IcraPage | İcra takibi |
| `/icra/:id` | IcraDetailPage | İcra detay |
| `/ai/chat` | AiChatPage | AI Sohbet |
| `/ai/document-generator` | DocumentGeneratorPage | Dilekçe üretici |
| `/ai/research` | ResearchPage | Emsal araştırma |
| `/profile` | ProfilePage | Profil |
| `/profile/edit` | EditProfilePage | Profil düzenle |
| `/profile/settings` | SettingsPage | Ayarlar |
| `/uets` | UetsPage | UETS bağlantısı |

### 5.3 Admin Sayfaları

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/admin/dashboard` | AdminDashboardPage | İstatistikler |
| `/admin/users` | AdminUsersPage | Kullanıcılar |
| `/admin/users/:id` | AdminUserDetailPage | Kullanıcı detay |
| `/admin/users/approve/:id` | ApproveUserPage | Onay bekleyen |
| `/admin/packages` | AdminPackagesPage | Paketler |
| `/admin/ai-config` | AiConfigPage | AI yapılandırma |
| `/admin/ai-config/:task` | AiConfigDetailPage | AI görev detay |
| `/admin/complaints` | AdminComplaintsPage | Şikayetler |
| `/admin/delegations` | AdminDelegationsPage | Tevkiller |
| `/admin/notifications` | AdminNotificationsPage | Bildirim gönder |
| `/admin/analytics` | AdminAnalyticsPage | Analitik |
| `/admin/settings` | AdminSettingsPage | Ayarlar |

---

## 6. Bileşenler

### 6.1 UI Bileşenleri

Base UI bileşenleri Atomic Design prensibine göre geliştirilmiştir.

```
components/ui/
├── button.tsx          # Variants: primary, secondary, outline, ghost, destructive
├── input.tsx           # Variants: default, error, success
├── select.tsx          # Single & multi-select
├── modal.tsx           # Dialog, Confirm, Alert
├── dropdown.tsx        # Simple dropdown, select dropdown
├── toast.tsx           # Success, error, warning, info
├── badge.tsx           # Status badge, count badge
├── card.tsx            # Elevated, outlined
├── table.tsx           # Data table with sorting, pagination
├── avatar.tsx          # User avatar with fallback
├── skeleton.tsx        # Loading placeholder
├── spinner.tsx         # Loading spinner
└── tooltip.tsx        # Hover tooltip
```

### 6.2 Feature Bileşenleri

Her özellik için özel bileşenler.

#### Dashboard Bileşenleri
- `StatsCard` - İstatistik kartı
- `UpcomingHearings` - Yaklaşan duruşmalar listesi
- `RecentNotifications` - Son tebligatlar
- `AiQuickChat` - Hızlı AI sohbet

#### Case Bileşenleri
- `CaseCard` - Dava kartı
- `CaseList` - Dava listesi
- `CaseDetail` - Dava detay görünümü
- `PartyInfo` - Taraf bilgisi

#### Notification Bileşenleri
- `NotificationCard` - Tebligat kartı
- `NotificationList` - Tebligat listesi
- `DeadlineBadge` - Süre badge'i
- `AiSummary` - AI özet görünümü

#### Delegation Bileşenleri
- `DelegationCard` - Tevkil kartı
- `LawyerCard` - Avukat kartı
- `RatingModal` - Puanlama modalı
- `StatusBadge` - Durum badge'i

#### AI Bileşenleri
- `ChatWindow` - Sohbet penceresi
- `ChatMessage` - Mesaj balonu
- `DocumentGenerator` - Belge üretici form
- `ResearchResults` - Araştırma sonuçları

#### Calendar Bileşenleri
- `CalendarView` - Takvim görünümü (FullCalendar)
- `EventModal` - Etkinlik modalı
- `EventCard` - Etkinlik kartı
- `CalendarFilter` - Filtre

---

## 7. API Entegrasyonu

### 7.1 API Servis Yapısı

```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Interceptors
api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Refresh token or logout
    }
    return Promise.reject(error);
  }
);
```

### 7.2 API Metodları

| Servis | Metodlar |
|--------|----------|
| `authService` | login, register, verifyOtp, forgotPassword, refreshToken |
| `casesService` | getList, getById, create, update, delete, addHearing |
| `notificationsService` | getList, getById, markRead, addReminder, linkToCase |
| `delegationsService` | create, accept, reject, rate, complain |
| `aiService` | summarize, extractDeadline, generateDocument, research |
| `calendarService` | getItems, getThisWeek, getThisMonth, getUpcoming |
| `icraService` | track, getById, addPayment, detectAssets |

### 7.3 API Tipleri

```typescript
// types/api.types.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
```

---

## 8. State Management

### 8.1 Zustand Store Yapısı

```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// store/cases.store.ts
interface CasesState {
  cases: Case[];
  selectedCase: Case | null;
  filters: CaseFilters;
  fetchCases: () => Promise<void>;
  createCase: (data: CreateCaseDto) => Promise<void>;
  updateCase: (id: string, data: UpdateCaseDto) => Promise<void>;
}
```

### 8.2 Store Listesi

| Store | Açıklama |
|-------|----------|
| `authStore` | Kullanıcı, token, auth durumu |
| `casesStore` | Dava listesi, seçili dava, filtreler |
| `notificationsStore` | Tebligat listesi, okunma durumu |
| `delegationsStore` | Tevkil listesi, durumlar |
| `aiStore` | AI sohbet geçmişi, üretilen belgeler |
| `uiStore` | Sidebar açık/kapalı, modal durumları, tema |

---

## 9. PWA Yapılandırması

### 9.1 manifest.json

```json
{
  "name": "AvukatPro",
  "short_name": "AvukatPro",
  "description": "Türkiye'nin Hukuk Asistanı",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 9.2 Service Worker

```javascript
// public/sw.js
// Cache strategies:
// - Static assets: Cache first
// - API calls: Network first
// - Images: Stale while revalidate
```

### 9.3 Kurulum

```bash
# Ana ekrana ekle butonu göster
navigator.installPrompt
```

---

## 10. Kurulum

### 10.1 Gereksinimler

- Node.js 18+
- npm veya yarn

### 10.2 Kurulum Adımları

```bash
# 1. Projeye git
cd AvukatPro/web

# 2. Bağımlılıkları yükle
npm install

# 3. Environment oluştur
cp .env.example .env.local
# .env.local düzenle

# 4. Geliştirme sunucusu başlat
npm run dev
```

### 10.3 Environment Değişkenleri

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Geliştirme

### 11.1 Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim build |
| `npm run start` | Üretim sunucusu |
| `npm run lint` | Lint kontrolü |
| `npm run lint:fix` | Lint düzeltme |
| `npm run format` | Prettier format |

### 11.2 Klasör Yapısı Kuralları

- **Sayfalar:** `app/` içinde route grupları ile organize
- **Bileşenler:** Atomic design - `ui/` → `features/` → `shared/`
- **Hook'lar:** Her özellik için ayrı hook dosyası
- **API Servisleri:** Feature bazlı ayrı dosyalar
- **Tipler:** Feature bazlı type dosyaları

---

## 12. Üretim

### 12.1 Build

```bash
npm run build
```

### 12.2 Deployment

```bash
# Vercel (önerilen)
vercel deploy

# Docker
docker build -t avocatpro-web .
docker run -p 3000:3000 avocatpro-web
```

---

<div align="center">

*AvukatPro Web Uygulaması*

*© 2026 AvukatPro. Tüm hakları saklıdır.*

</div>