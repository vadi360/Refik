# Refik Chrome Eklentisi

<div align="center">

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**Proje:** Refik - UYAP Tarayıcı Eklentisi  
**GitHub:** https://github.com/vadi360/Refik

*UYAP'tan otomatik dosya çekme ve özetleme*

---

| Durum | Değer |
|-------|-------|
| Manifest | Version 3 |
| Browser | Chrome 88+ |
| Backend | NestJS API |
| Framework | Vanilla JS + React (Popup) |
| Storage | Chrome Storage API |

</div>

---

## 📋 İçindekiler

1. [Hakkında](#1-hakkında)
2. [Özellikler](#2-özellikler)
3. [Teknoloji Stack](#3-teknoloji-stack)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Modüller](#5-modüller)
6. [UYAP Entegrasyonu](#6-uyap-entegrasyonu)
7. [Manifest Yapılandırması](#7-manifest-yapılandırması)
8. [Kurulum](#8-kurulum)
9. [Build & Deploy](#9-build--deploy)

---

## 1. Hakkında

Refik Chrome Eklentisi, avukatların UYAP (Ulusal Yargı Ağı Platformu) sisteminden dosya bilgilerini otomatik olarak çekmesini ve AI destekli özetleme yapmasını sağlayan tarayıcı eklentisidir.

### Temel Özellikler

- **UYAP Otomatik Tanıma** — UYAP sayfalarını otomatik algılama
- **Dosya Bilgisi Çekme** — Taraflar, duruşmalar, kararları çıkarma
- **Tek Tıkla Özet** — Seçili dosyayı AI ile özetleme
- **RAG Entegrasyonu** — Pinecone'da arama, benzer dosyaları bulma
- **Hızlı Bildirim** — Duruşma hatırlatıcısı oluşturma

---

## 2. Özellikler

### 2.1 UYAP Scraping

| Özellik | Açıklama |
|---------|----------|
| Sayfa Algılama | UYAP sayfa türlerini tanıma |
| Dosya Numarası | Otomatik dosya numarası çıkarma |
| Taraf Bilgileri | Davacı, davalı bilgileri |
| Duruşma Bilgileri | Tarih, saat, salon, sonuç |
| Karar Bilgileri | Karar tarihi, içerik özeti |

### 2.2 AI Entegrasyonu

| Özellik | Açıklama |
|---------|----------|
| Dosya Özeti | case_summary görevi |
| Süre Çıkarımı | deadline_extract görevi |
| Karar Analizi | decision_analysis görevi |
| RAG Arama | Pinecone similarity search |

### 2.3 Bildirim

| Özellik | Açıklama |
|---------|----------|
| Duruşma Hatırlatıcı | Takvime ekleme |
| Süre Uyarısı | Kritik süre bildirimi |
| Tevkil Önerisi | UYAP'ta görülen duruşma için |

### 2.4 Popup Arayüzü

| Özellik | Açıklama |
|---------|----------|
| Hızlı İşlemler | Özet, ara, hatırlatıcı |
| Dosya Geçmişi | Son taranan dosyalar |
| Bağlantı Durumu | UYAP + Backend bağlantısı |
| Ayarlar | Hesap, bildirim tercihleri |

---

## 3. Teknoloji Stack

### 3.1 Core Teknolojiler

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| Manifest | Chrome Manifest V3 | Güncel eklenti standardı |
| Background | Service Worker | Chrome 88+ async model |
| Content | Content Script | UYAP sayfa erişimi |
| UI | React | Popup arayüzü |
| Storage | Chrome Storage API | Local veri depolama |

### 3.2 Ek Kütüphaneler

| Kütüphane | Kullanım |
|-----------|----------|
| React | Popup UI |
| React DOM | DOM rendering |
| @tanstack/react-query | API istekleri |
| date-fns | Tarih işlemleri |

---

## 4. Klasör Yapısı

```
chrome-extension/
├── src/
│   ├── background/                # Service Worker
│   │   ├── service-worker.ts     # Background script
│   │   ├── api.ts                # Backend API calls
│   │   ├── storage.ts            # Chrome storage
│   │   ├── uyap-detector.ts      # UYAP page detection
│   │   └── message-handler.ts    # Message passing
│   │
│   ├── content/                  # Content Scripts
│   │   ├── script.ts             # Ana content script
│   │   ├── uyap-parser.ts        # UYAP sayfa parser
│   │   │   ├── parser-utils.ts   # Helper fonksiyonlar
│   │   │   └── selectors.ts      # DOM selector'ları
│   │   ├── styles.css            # Content styles
│   │   └── components/           # UI inject bileşenleri
│   │       ├── highlight-overlay.tsx
│   │       └── action-button.tsx
│   │
│   ├── popup/                    # Popup UI
│   │   ├── popup.html            # HTML entry
│   │   ├── popup.tsx             # React entry
│   │   ├── App.tsx              # Main app component
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── FileHistory.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useUYAPData.ts
│   │   │   ├── useBackend.ts
│   │   │   └── useStorage.ts
│   │   └── styles/
│   │       └── popup.css
│   │
│   ├── options/                  # Options Page
│   │   ├── options.html
│   │   ├── options.tsx
│   │   └── options.css
│   │
│   └── utils/                    # Paylaşılan yardımcılar
│       ├── storage.ts            # Chrome storage wrapper
│       ├── api.ts               # API helpers
│       ├── logger.ts            # Logging
│       └── constants.ts          # Sabitler
│
├── icons/                        # Eklenti ikonları
│   ├── icon16.png               # Toolbar icon (16x16)
│   ├── icon32.png               # Toolbar icon (32x32)
│   ├── icon48.png               # Extension page (48x48)
│   ├── icon128.png              # Chrome Web Store (128x128)
│   └── icon256.png              # Chrome Web Store (256x256)
│
├── _locales/                     # Localization
│   └── tr/
│       └── messages.json        # Türkçe çeviriler
│
├── assets/                       # Statik dosyalar
│   ├── images/
│   │   ├── uyap-logo.png
│   │   └── placeholder.png
│   └── sounds/
│       └── notification.mp3
│
├── manifest.json                 # Manifest V3
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite build config
├── webpack.config.js            # Webpack (alternative)
└── README.md                    # (bu dosya)
```

---

## 5. Modüller

### 5.1 Background Service Worker

Background script, eklentinin merkezi yönetim noktasıdır.

```typescript
// src/background/service-worker.ts

// Ana görevler:
// 1. Message handling (content ↔ popup ↔ backend)
// 2. Chrome storage yönetimi
// 3. Context menu creation
// 4. Alarm/Timer yönetimi
// 5. Notification gönderme
```

#### Mesaj İşleyicisi

```typescript
// Message types
type MessageType = 
  | 'UYAP_PAGE_DETECTED'
  | 'FETCH_FILE_DATA'
  | 'SUMMARIZE_FILE'
  | 'CREATE_REMINDER'
  | 'CHECK_CONNECTION';
```

### 5.2 Content Script

Content script, UYAP sayfalarında çalışır.

```typescript
// src/content/script.ts

// UYAP sayfa türleri:
// - Ana sayfa (dashboard)
// - Dosya arama
// - Dosya detay
// - Duruşma listesi
// - Karar görüntüleme
```

#### UYAP Parser

```typescript
// src/content/uyap-parser.ts

interface UYAPFileData {
  caseNumber: string;
  court: string;
  caseType: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  hearings: Hearing[];
  decisions: Decision[];
  status: string;
}
```

### 5.3 Popup UI

React tabanlı popup arayüzü.

```
┌────────────────────────────────────┐
│  🔷 Refik           [⚙️] [❌]  │
├────────────────────────────────────┤
│                                    │
│  [📋] Özet     [🔍] Ara    [⏰] Hatır│
│                                    │
│  ──────────────────────────────    │
│                                    │
│  SON TARANAN DOSYALAR              │
│  ┌──────────────────────────────┐  │
│  │ 2024/001 - Alacak Davası     │  │
│  │ 15.06.2026 - İstanbul 5. AH  │  │
│  │ [Özet] [Hatırlat]            │  │
│  └──────────────────────────────┘  │
│                                    │
│  ──────────────────────────────    │
│                                    │
│  DURUM: ✅ Bağlı                   │
│  UYAP: ✅ Bağlı                    │
│                                    │
└────────────────────────────────────┘
```

### 5.4 Options Page

Kullanıcı ayarları sayfası.

```
┌────────────────────────────────────┐
│  Refik Ayarlar                 │
├────────────────────────────────────┤
│                                    │
│  HESAP                             │
│  ├─ Backend URL: [https://...]    │
│  ├─ Token: [••••••••]             │
│  └─ [Çıkış Yap]                   │
│                                    │
│  BİLDİRİMLER                       │
│  ├─ [✓] Duruşma hatırlatıcıları   │
│  ├─ [✓] Süre uyarıları            │
│  ├─ [✓] Tevkil önerileri          │
│  └─ Ses: [🔔]                     │
│                                    │
│  YEREL VERİ                        │
│  ├─ Önbellek: [🗑️] Temizle       │
│  └─ Geçmiş: [🗑️] Sil             │
│                                    │
│  HAKKINDA                          │
│  └─ Versiyon: 1.0.0               │
│                                    │
└────────────────────────────────────┘
```

---

## 6. UYAP Entegrasyonu

### 6.1 Desteklenen Sayfalar

| Sayfa | URL Pattern | Parser |
|-------|-------------|--------|
| Dashboard | `uyap.adalet.gov.tr` | Detects if logged in |
| Dosya Arama | `/Dosya/DosyaArama` | Case search results |
| Dosya Detay | `/Dosya/DosyaDetay` | Full file data |
| Duruşma Listesi | `/Durusma/DurusmaListesi` | Hearing info |
| Karar Görüntüleme | `/Karar/KararGoruntuleme` | Decision content |

### 6.2 DOM Selector'ları

```typescript
// src/content/uyap-parser/selectors.ts

export const SELECTORS = {
  // Dosya detay sayfası
  caseNumber: '.dosya-no',
  court: '.mahkeme-adi',
  caseType: '.dava-turu',
  plaintiff: '.davaci',
  defendant: '.davali',
  hearingTable: 'table.durusma-tablo',
  decisionContent: 'div.karar-icerik',
  
  // Genel
  loadingIndicator: '.yukleniyor',
  errorMessage: '.hata-mesaji',
};
```

### 6.3 Veri Çıkarma Akışı

```
1. Kullanıcı UYAP'ta dosya açıyor
           ↓
2. Content script sayfayı algılıyor
           ↓
3. UYAP parser çalışıyor
           ↓
4. Veriler extract ediliyor
           ↓
5. Background'a mesaj gönderiliyor
           ↓
6. Backend'e POST isteği
           ↓
7. RAG/Pinecone araması (opsiyonel)
           ↓
8. Sonuç popup'ta gösteriliyor
```

---

## 7. Manifest Yapılandırması

### 7.1 manifest.json

```json
{
  "manifest_version": 3,
  "name": "Refik - UYAP Yardımcısı",
  "version": "1.0.0",
  "description": "UYAP'tan otomatik dosya çekme ve AI özetleme",
  "permissions": [
    "storage",
    "tabs",
    "activeTab",
    "notifications",
    "contextMenus",
    "alarms"
  ],
  "host_permissions": [
    "https://uyap.adalet.gov.tr/*",
    "https://api.refik.app/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["https://uyap.adalet.gov.tr/*"],
      "js": ["src/content/script.js"],
      "css": ["src/content/styles.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "default_title": "Refik"
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["https://uyap.adalet.gov.tr/*"]
    }
  ]
}
```

### 7.2 Context Menu

```typescript
// Background'da context menu oluşturma
chrome.contextMenus.create({
  id: 'summarize-file',
  title: 'Bu Dosyayı Özetle',
  contexts: ['page'],
});

chrome.contextMenus.create({
  id: 'create-reminder',
  title: 'Duruşma Hatırlatıcısı Oluştur',
  contexts: ['page'],
});
```

---

## 8. Kurulum

### 8.1 Geliştirme Kurulumu

```bash
# 1. Projeye git
cd Refik/chrome-extension

# 2. Bağımlılıkları yükle
npm install

# 3. Build et
npm run build

# 4. Chrome'a yükle
# - chrome://extensions aç
# - Developer mode aç
# - Load unpacked -> dist/ klasörünü seç
```

### 8.2 Environment

```bash
# .env dosyası
VITE_API_URL=https://api.refik.app/api/v1
VITE_UYAP_URL=https://uyap.adalet.gov.tr
```

---

## 9. Build & Deploy

### 9.1 Build

```bash
# Production build
npm run build

# Output: dist/
```

### 9.2 Chrome Web Store

```bash
# Zip oluştur
zip -r avocatpro-extension.zip dist/

# Chrome Web Store Developer Dashboard:
# https://chrome.google.com/webstore/devconsole
```

### 9.3 Güncelleme

1. `manifest.json` version artır
2. `npm run build`
3. `.zip` oluştur
4. Developer Dashboard'a yükle

---

## 10. Güvenlik

### 10.1 Content Script İzolasyonu

- UYAP sayfasından veri çekme sadece parser üzerinden
- Doğrudan DOM erişimi yasak
- XSS koruması için sanitization

### 10.2 API Güvenliği

- Backend API'ye sadece JWT token ile erişim
- Token Chrome Storage'da şifrelenmiş saklanır
- HTTPS zorunlu

---

<div align="center">

*Refik Chrome Eklentisi*

*© 2026 Refik. Tüm hakları saklıdır.*

</div>