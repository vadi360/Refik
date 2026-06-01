# AvukatPro

<div align="center">

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**GitHub:** https://github.com/vadi360/AvukatPro

*Mobil öncelikli, AI destekli hukuk asistanı ve tevkil pazar yeri*

---

| Proje | Durum | Teknoloji |
|-------|-------|-----------|
| **Backend** | ✅ TAMAMLANDI | NestJS + TypeScript |
| **Web Uygulaması** | 📋 PLANLANIYOR | Next.js + PWA |
| **Mobil Uygulama** | 📋 PLANLANIYOR | React Native |
| **Admin Panel** | 📋 PLANLANIYOR | Next.js |
| **Chrome Eklentisi** | 📋 PLANLANIYOR | Manifest V3 |

</div>

---

## 📋 İçindekiler

- [Hakkında](#hakkında)
- [Proje Yapısı](#proje-yapısı)
- [Backend](#backend)
- [Frontend Uygulamaları](#frontend-uygulamaları)
- [Kurulum](#kurulum)
- [Dokümantasyon](#dokümantasyon)
- [Katkı](#katkı)

---

## 🔰 Hakkında

AvukatPro, Türkiye'deki avukatlara yönelik, mobil öncelikli yapay zekâ destekli bir hukuk asistanı ve tevkil pazar yeridir.

### Temel Özellikler

| # | Özellik | Açıklama |
|---|---------|----------|
| 1 | **Tevkil Pazar Yeri** | Avukatlar arası otomatik eşleştirme ile duruşma/işlem takibi |
| 2 | **UETS Entegrasyonu** | PTT UETS'ten tebligat çekme ve AI ile analiz |
| 3 | **UYAP Dosya Özetleme** | Tarayıcı eklentisi ile UYAP'tan dosya çekme |
| 4 | **Otomatik Belge Üretimi** | AI ile dilekçe, ihtarname, içtihat araştırması |
| 5 | **İcra Takibi** | Toplu icra takibi, mal varlığı tespiti |
| 6 | **Birleşik Takvim** | Duruşmalar, hatırlatıcılar, tebligatlar, icra takvimi |
| 7 | **Çoklu Kanal Bildirim** | Push, SMS, Email, WhatsApp, Telegram |

### Hedef Kitle

- **Birincil:** Solo avukatlar ve küçük hukuk büroları (4 kişiye kadar)
- **İkincil:** Orta ölçekli hukuk büroları (B2B paket)
- **Coğrafya:** Türkiye (ulusal)

### Fiyatlandırma

| Paket | Fiyat | Token Limit |
|-------|-------|-------------|
| Basic | 199₺/ay | 1.000 |
| Standard | 499₺/ay | 3.000 |
| Professional | 999₺/ay | 10.000 |
| Enterprise | 1.999₺/ay | 50.000 |

---

## 📁 Proje Yapısı

```
AvukatPro/
│
├── backend/                          # ✅ TAMAMLANDI
│   ├── src/
│   │   ├── modules/                   # 21 modül
│   │   ├── prisma/                   # Veritabanı şeması
│   │   ├── common/                   # Ortak bileşenler
│   │   └── main.ts                  # Giriş noktası
│   ├── package.json
│   ├── README.md                    # Backend detaylı doküman
│   └── .env.example                 # Environment şablonu
│
├── web/                              # 📋 PLANLANIYOR - Next.js PWA
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   ├── components/               # React bileşenleri
│   │   ├── pages/                   # Sayfalar
│   │   ├── hooks/                   # Custom hooks
│   │   ├── services/                # API servisleri
│   │   ├── store/                   # State management
│   │   └── styles/                  # CSS/SCSS
│   ├── public/
│   │   ├── icons/                   # PWA ikonları
│   │   └── manifest.json           # PWA manifest
│   └── package.json
│
├── mobile/                           # 📋 PLANLANIYOR - React Native
│   ├── src/
│   │   ├── screens/                 # Ekranlar
│   │   ├── components/             # Bileşenler
│   │   ├── navigation/             # React Navigation
│   │   ├── services/              # API servisleri
│   │   ├── store/                 # State management (Redux/Zustand)
│   │   ├── hooks/                 # Custom hooks
│   │   ├── utils/                 # Yardımcı fonksiyonlar
│   │   └── assets/                # Görseller, fontlar
│   ├── ios/                        # iOS native kod
│   ├── android/                    # Android native kod
│   ├── App.tsx                     # Uygulama giriş noktası
│   └── package.json
│
├── admin/                            # 📋 PLANLANIYOR - Next.js
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   ├── components/             # Admin bileşenleri
│   │   ├── pages/                 # Admin sayfaları
│   │   ├── services/              # API servisleri
│   │   └── styles/                # CSS
│   ├── public/
│   └── package.json
│
├── chrome-extension/                 # 📋 PLANLANIYOR - Manifest V3
│   ├── src/
│   │   ├── background/            # Service worker
│   │   ├── content/              # Content script
│   │   ├── popup/                # Popup UI
│   │   ├── options/             # Options page
│   │   └── utils/               # Yardımcı fonksiyonlar
│   ├── icons/                    # Eklenti ikonları
│   ├── manifest.json            # Manifest V3
│   └── package.json
│
├── .agents/                         # Agent yönergeleri
│   ├── AGENTS.md                # Kod geliştirme kuralları
│   └── CLAUDE.md                # Claude özel yönergeler
│
├── docs/                            # Dokümantasyon
│   └── (future additional docs)
│
├── AVUKATPRO_MASTER_PLAN_v3.md      # Master ürün planı
├── IMPLEMENTATION_PLAN_v1.md        # Uygulama planı
├── SYSTEM_SCHEMA.md                  # Teknik şema
│
├── README.md                        # (bu dosya)
└── LICENSE                          # MIT Lisans
```

---

## 💻 Backend

**Durum:** ✅ TAMAMLANDI

### Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Runtime | Node.js 18+ |
| Framework | NestJS 10 |
| Language | TypeScript 5.3 |
| Database | PostgreSQL 14+ |
| ORM | Prisma 5 |
| Cache | Redis |
| Auth | JWT + OTP |

### Modüller (21 Adet)

| Modül | Açıklama |
|-------|----------|
| `auth` | JWT + OTP kimlik doğrulama |
| `users` | Kullanıcı CRUD, arama |
| `cases` | Dava dosyaları, duruşmalar |
| `notifications` | Tebligatlar, 5 gün kuralı |
| `delegations` | Tevkil pazarı |
| `documents` | PDF/Word/UDF üretimi |
| `reminders` | Hatırlatıcılar |
| `ai` | Minimax + Claude hibrit sistem |
| `admin` | Admin panel API'leri |
| `uets` | PTT UETS entegrasyonu |
| `uyap` | UYAP Chrome eklentisi backend |
| `cron` | 7 background job |
| `rag` | Pinecone RAG sistemi |
| `files` | CloudFlare R2 |
| `payments` | iyzico/PayTR/Stripe |
| `user-documents` | Özlük dosyası |
| `icra` | İcra takibi |
| `call-center` | Borçlu arama |
| `calendar` | Birleşik takvim |
| `notifications` (multi-channel) | 5 kanal bildirim |
| `health` | Sağlık kontrolü |

### AI Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    HİBRİT AI SİSTEMİ                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin Panel → AI Görev Yapılandırması                     │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────┐           │
│  │  taskType       │  Model    │  Token Limit   │           │
│  ├─────────────────────────────────────────────┤           │
│  │  notification_summary │ MINIMAX │ YOK (sınırsız)│         │
│  │  deadline_extract     │ CLAUDE  │ YOK (sınırsız)│         │
│  │  case_summary         │ MINIMAX │ VAR          │         │
│  │  decision_analysis    │ CLAUDE  │ VAR          │         │
│  │  document_generate    │ MINIMAX │ VAR          │         │
│  │  legal_research       │ CLAUDE  │ VAR          │         │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  UETS görevleri: notification_summary, deadline_extract    │
│  → Token limit YOK (sınırsız)                              │
│                                                             │
│  Diğer görevler: Token limitli (paket bazlı)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Bildirim Kanalları (5 Adet)

| Kanal | Servis |
|-------|--------|
| Push | Firebase FCM |
| SMS | NetGSM |
| Email | SendGrid |
| WhatsApp | WhatsApp Business |
| Telegram | Telegram Bot API |

### API Endpoint'leri

| Modül | Endpoint Sayısı |
|-------|----------------|
| Auth | ~10 |
| Users | ~8 |
| Cases | ~10 |
| Notifications | ~12 |
| Delegations | ~8 |
| Documents | ~6 |
| AI | ~10 |
| Admin | ~10 |
| Diğerleri | ~20 |
| **Toplam** | **~90+** |

### Detaylı Doküman

Backend hakkında detaylı bilgi için: [backend/README.md](backend/README.md)

---

## 📱 Frontend Uygulamaları

### Web Uygulaması (Next.js + PWA)

**Durum:** 📋 PLANLANIYOR

```
web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth sayfaları
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (app)/                  # Ana uygulama
│   │   │   ├── dashboard/          # Ana panel
│   │   │   ├── cases/              # Dosyalar
│   │   │   │   ├── list/
│   │   │   │   ├── detail/[id]/
│   │   │   │   └── new/
│   │   │   ├── hearings/          # Duruşmalar
│   │   │   ├── notifications/     # Tebligatlar
│   │   │   ├── delegations/       # Tevkiller
│   │   │   ├── documents/         # Belgeler
│   │   │   ├── calendar/          # Takvim
│   │   │   ├── icra/             # İcra takibi
│   │   │   ├── ai/                # AI asistan
│   │   │   └── profile/           # Profil
│   │   │
│   │   ├── (admin)/               # Admin panel
│   │   │   ├── users/
│   │   │   ├── packages/
│   │   │   ├── ai-config/
│   │   │   ├── complaints/
│   │   │   └── analytics/
│   │   │
│   │   └── page.tsx               # Landing page
│   │
│   ├── components/                 # Paylaşılan bileşenler
│   │   ├── ui/                    # Base UI (Button, Input, vb.)
│   │   ├── layout/                # Layout bileşenleri
│   │   ├── forms/                 # Form bileşenleri
│   │   └── features/              # Özellik bileşenleri
│   │
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # API servisleri
│   ├── store/                     # State management
│   ├── utils/                     # Yardımcı fonksiyonlar
│   ├── types/                     # TypeScript tipleri
│   └── styles/                    # Global stiller
│
├── public/
│   ├── icons/                     # PWA ikonları
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
├── next.config.js
├── tailwind.config.js
└── package.json
```

### Mobil Uygulama (React Native)

**Durum:** 📋 PLANLANIYOR

```
mobile/
├── src/
│   ├── screens/                   # Ekranlar
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── OtpScreen.tsx
│   │   │
│   │   ├── main/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── CasesScreen.tsx
│   │   │   ├── CaseDetailScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── DelegationsScreen.tsx
│   │   │   ├── DocumentsScreen.tsx
│   │   │   ├── CalendarScreen.tsx
│   │   │   ├── IcraScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   └── ai/
│   │       ├── AiChatScreen.tsx
│   │       ├── DocumentGeneratorScreen.tsx
│   │       └── LegalResearchScreen.tsx
│   │
│   ├── components/               # Bileşenler
│   │   ├── ui/                   # Base UI
│   │   ├── cards/                # Kart bileşenleri
│   │   ├── lists/                # Liste bileşenleri
│   │   └── forms/                # Form bileşenleri
│   │
│   ├── navigation/               # React Navigation
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/                 # API servisleri
│   ├── store/                    # State management
│   │   ├── slices/
│   │   └── store.ts
│   │
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Yardımcı fonksiyonlar
│   ├── constants/                # Sabitler
│   ├── types/                    # TypeScript tipleri
│   └── assets/                   # Görseller, fontlar
│
├── ios/                           # iOS native
│   ├── AvukatPro/
│   └── AvukatPro.xcworkspace
│
├── android/                      # Android native
│   └── app/
│
├── App.tsx                       # Uygulama giriş noktası
├── index.js                     # Metro bundler giriş
└── package.json
```

### Admin Panel (Next.js)

**Durum:** 📋 PLANLANIYOR

```
admin/
├── src/
│   ├── app/
│   │   ├── dashboard/            # İstatistikler
│   │   ├── users/               # Kullanıcı yönetimi
│   │   │   ├── list/
│   │   │   ├── detail/[id]/
│   │   │   └── approve/[id]/
│   │   ├── packages/            # Paket yönetimi
│   │   ├── ai-config/           # AI yapılandırma
│   │   │   └── [taskType]/
│   │   ├── complaints/          # Şikayetler
│   │   ├── delegations/         # Tevkiller
│   │   ├── notifications/       # Bildirim gönder
│   │   ├── analytics/           # İstatistikler
│   │   └── settings/            # Ayarlar
│   │
│   ├── components/
│   ├── services/
│   └── styles/
│
├── public/
└── package.json
```

### Chrome Eklentisi (Manifest V3)

**Durum:** 📋 PLANLANIYOR

```
chrome-extension/
├── src/
│   ├── background/
│   │   ├── service-worker.ts    # Background script
│   │   └── api.ts              # Backend API
│   │
│   ├── content/
│   │   ├── script.ts           # UYAP scraping
│   │   ├── uyap-parser.ts     # UYAP sayfa parser
│   │   └── styles.css         # Content styles
│   │
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.tsx
│   │   └── components/
│   │
│   ├── options/
│   │   ├── options.html
│   │   └── options.tsx
│   │
│   └── utils/
│       ├── storage.ts          # Chrome storage
│       └── logger.ts
│
├── icons/                       # Eklenti ikonları (16, 32, 48, 128)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
├── manifest.json               # Manifest V3
├── package.json
└── README.md
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm veya yarn

### Backend Kurulumu

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

# 5. Geliştirme sunucusunu başlatın
npm run start:dev
```

### Environment Değişkenleri

Detaylı bilgi için: [backend/README.md](backend/README.md#-yapılandırma)

---

## 📚 Dokümantasyon

| Doküman | Açıklama |
|---------|----------|
| [AVUKATPRO_MASTER_PLAN_v3.md](AVUKATPRO_MASTER_PLAN_v3.md) | Master ürün ve teknik plan |
| [IMPLEMENTATION_PLAN_v1.md](IMPLEMENTATION_PLAN_v1.md) | Uygulama planı, ekran tasarımları |
| [SYSTEM_SCHEMA.md](SYSTEM_SCHEMA.md) | Teknik şema, mimari |
| [backend/README.md](backend/README.md) | Backend detaylı doküman |
| [.agents/AGENTS.md](.agents/AGENTS.md) | Kod geliştirme kuralları |
| [.agents/CLAUDE.md](.agents/CLAUDE.md) | Claude özel yönergeler |

---

## 🎯 Roadmap

```
Q1 2026 (Tamamlandı)     │████████████████████████│ Backend ✓
                          │
Q2 2026 (Devam Ediyor)   │░░░░░░░░░░░░░░░░░░░░░░░│ Web App
                          │
Q3 2026                   │░░░░░░░░░░░░░░░░░░░░░░░│ Mobile App
                          │
Q4 2026                   │░░░░░░░░░░░░░░░░░░░░░░░│ Admin Panel
                          │
2027                      │░░░░░░░░░░░░░░░░░░░░░░░│ Chrome Extension
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

Bu proje MIT Lisansı altında lisanslanmıştır.

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