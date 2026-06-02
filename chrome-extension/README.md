<p align="center">
  <img src="https://raw.githubusercontent.com/vadi360/Refik/main/chrome-extension/icons/logo.svg" alt="Refik Logo" width="128" />
</p>

<div align="center">

# Refik Chrome Eklentisi

*UYAP'tan otomatik dosya çekme ve AI özetleme*

[![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=Google-Chrome)](https://chrome.google.com/webstore)
[![Manifest](https://img.shields.io/badge/Manifest-V3-FF6B6B?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Chrome 88+](https://img.shields.io/badge/Chrome-88+-82BASA?style=flat-square&logo=Google-Chrome)](https://www.google.com/chrome/)

---

| 🟢 | **Versiyon** | 1.0.0 |
|---|-------------|-------|
| 🟢 | **Manifest** | V3 |
| 🟢 | **Browser** | Chrome 88+ |
| 🟡 | **İkonlar** | ⚠️ Eklenmeli |
| 🟡 | **Build** | ⚠️ `npm run build` gerekli |
| 🟡 | **Store** | ⏳ Chrome Web Store'da |

**Backend:** [api.refik.app](https://api.refik.app) | **Ana Proje:** [Refik](../README.md)

</div>

---

## 🎯 Ne İşe Yarar?

<p align="center">
  <img src="https://img.shields.io/badge/📁-Otomatik%20Dosya%20Tanıma-10B981?style=for-the-badge" alt="Otomatik Dosya" />
  <img src="https://img.shields.io/badge/🤖-AI%20Özetleme-F59E0B?style=for-the-badge" alt="AI Özetleme" />
  <img src="https://img.shields.io/badge/⏰-Hatırlatıcı%20Oluşturma-3B82F6?style=for-the-badge" alt="Hatırlatıcı" />
  <img src="https://img.shields.io/badge/🔔-5%20Gün%20Kuralı-8B5CF6?style=for-the-badge" alt="5 Gün Kuralı" />
</p>

> UYAP'ta her dosya açtığınızda **Refik** otomatik olarak bilgileri çeker, özetler ve hatırlatıcı oluşturur.

---

## ✨ Özellikler

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| 📁 **Otomatik Dosya Tanıma** | UYAP sayfalarını algılar | ✅ |
| 🔍 **Veri Çekme** | Taraflar, duruşmalar, kararlar | ✅ |
| 🤖 **AI Özetleme** | Dosya içeriğini analiz eder | ✅ |
| ⏰ **Hatırlatıcı** | Duruşma hatırlatıcısı oluştur | ✅ |
| 🔔 **Context Menu** | Sağ tık menüsü desteği | ✅ |
| ⌨️ **Kısayol** | `Ctrl+Shift+R` popup aç | ✅ |
| 🔐 **Güvenli** | JWT token ile iletişim | ✅ |
| 🌐 **Çoklu Dil** | Türkçe destekli | ✅ |

---

## 📸 Desteklenen UYAP Sayfaları

| Sayfa | Veriler |
|-------|---------|
| 📊 **Dashboard** | Genel bakış, özet istatistikler |
| 🔍 **Dosya Arama** | Arama sonuçları |
| 📋 **Dosya Detay** | Tam dosya bilgileri, taraflar |
| 📅 **Duruşma Listesi** | Duruşma tarihleri, sonuçlar |
| ⚖️ **Karar Görüntüleme** | Karar metinleri |
| 👥 **Taraflar** | Davacı, davalı bilgileri |
| 📄 **Belgeler** | Belge listesi |

---

## 🏗️ Teknoloji Stack

<div align="left">

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=React&logoColor=black)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)
![esbuild](https://img.shields.io/badge/-esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black)
![Chrome API](https://img.shields.io/badge/-Chrome%20API-4285F4?style=for-the-badge&logo=Google-Chrome&logoColor=white)

</div>

---

## 📁 Klasör Yapısı

```
chrome-extension/
├── manifest.json           # Manifest V3 yapılandırması
├── package.json
├── vite.config.ts          # Vite build config
├── tsconfig.json           # TypeScript config
│
├── src/
│   ├── background/
│   │   └── service-worker.ts   # Ana background script
│   │
│   ├── content/
│   │   ├── script.ts           # Content script (UYAP'ta çalışır)
│   │   ├── uyap-parser.ts      # UYAP veri çekiciler
│   │   └── styles.css          # Toast/stil dosyaları
│   │
│   └── popup/
│       ├── popup.html         # Popup giriş noktası
│       └── popup.tsx          # React popup UI
│
├── icons/                   # Eklenti ikonları
├── _locales/
│   └── tr/
│       └── messages.json      # Türkçe lokalizasyon
│
└── dist/                   # Build çıktısı (Chrome'a yüklenecek)
```

---

## 🔧 Kurulum

### Geliştirme

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Development (watch mode)
npm run dev

# 3. Build et
npm run build

# 4. Chrome'a yükle
# - chrome://extensions aç
# - Developer mode aç
# - "Load unpacked" → dist/ klasörünü seç
```

### Production (Chrome Web Store)

```bash
# 1. Build et
npm run build

# 2. dist/ klasörünü ZIP'le
# Windows: Sağ tık → "Gönder" → "Sıkıştırılmış ZIP klasörü"

# 3. Chrome Web Store'a yükle
# https://chrome.google.com/webstore/devconsole
```

---

## 🚀 Kullanım

### 1. Giriş
```
• Popup'u aç (Ctrl+Shift+R veya eklenti ikonu)
• Refik hesabı token'ını gir
• "Giriş Yap" tıkla
```

### 2. UYAP'ta Kullanım
```
• UYAP'ta bir dosya aç
• Refik otomatik olarak dosyayı algılar
• Sağ üstte "Refik" butonu görünür
```

### 3. İşlemler
```
📋 Özet: AI ile dosyayı özetle
⏰ Hatırlat: Duruşma hatırlatıcısı oluştur
📁 Ekle: Dosyayı Refik hesabına ekle
```

---

## 🔐 Manifest Permissions

| Permission | Kullanım |
|------------|----------|
| `storage` | Token ve ayarları sakla |
| `tabs` | Aktif sekme bilgisini al |
| `activeTab` | UYAP sayfasına erişim |
| `notifications` | Hatırlatıcı bildirimleri |
| `contextMenus` | Sağ tık menüsü |
| `alarms` | Periyodik kontrol |
| `scripting` | UYAP'a script enjekte etme |

---

## 🌐 Host Permissions

| Host | Kullanım |
|------|----------|
| `https://uyap.adalet.gov.tr/*` | UYAP sayfalarına erişim |
| `https://api.refik.app/*` | Backend API iletişimi |

---

## 📡 API Entegrasyonu

### Backend Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/ai/case-update` | POST | Dosya güncelle + AI analiz |
| `/ai/case-update/:id/summary` | GET | AI özet getir |
| `/reminders` | POST | Hatırlatıcı oluştur |
| `/cases` | POST | Dosya ekle |
| `/auth/verify-token` | POST | Token doğrula |

---

## 🎨 UI Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │   LOGIN     │───▶│   POPUP     │───▶│   UYAP      │     │
│   │   SCREEN    │    │   MAIN      │    │   DETECT    │     │
│   └─────────────┘    └──────┬──────┘    └──────┬──────┘     │
│                             │                    │            │
│                             │              ┌─────▼─────┐     │
│                             │              │  EXTRACT  │     │
│                             │              │   DATA    │     │
│                             │              └─────┬─────┘     │
│                             │                    │            │
│                             │    ┌───────────────┼────────┐  │
│                             │    ▼               ▼        │  │
│                             │  ┌───────┐    ┌────────┐  │  │
│                             └─▶│ SUMMARIZE │  │REMINDER│────┘  │
│                                └───────┘    └────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

| Sorun | Çözüm |
|-------|-------|
| Popup açılmıyor | `chrome://extensions` → Eklentiyi yeniden yükle |
| UYAP algılanmıyor | UYAP'ta dosya açık olduğundan emin ol |
| Token hatası | Token'ın geçerli olduğunu kontrol et |
| Build hatası | `npm install` çalıştır, sonra tekrar dene |

---

## 📄 Lisans

**MIT License** - Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

---

<div align="center">

**Vadi360** tarafından 💜 ile geliştirildi

[refik.app](https://refik.app) | [github.com/vadi360](https://github.com/vadi360)

</div>