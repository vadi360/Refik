<p align="center">
  <img src="https://refik.app/banner.png" alt="Refik Banner" width="100%" />
</p>

<div align="center">

# Refik Mobil Uygulaması

*iOS & Android - Mobil öncelikli, AI destekli hukuk asistanı*

[![React Native](https://img.shields.io/badge/react%20native-Expo-000000?style=flat-square&logo=Expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-3178C6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org)
[![iOS](https://img.shields.io/badge/iOS-13+-A2AAAD?style=flat-square&logo=Apple)](https://apple.com)
[![Android](https://img.shields.io/badge/Android-API%2024+-3DDC84?style=flat-square&logo=Android)](https://android.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

| 🟡 | **Versiyon** | 1.0.0 (Planlanıyor) |
|---|-------------|----------------------|
| 🟡 | **Framework** | React Native (Expo) |
| 🟡 | **Language** | TypeScript 5.3 |
| 🟡 | **iOS** | 13+ |
| 🟡 | **Android** | API 24+ (Android 7.0+) |
| 🟡 | **State** | Zustand |
| 🟡 | **Navigation** | React Navigation 6 |

**Backend:** [api.refik.app](https://api.refik.app) | **Ana Proje:** [Refik](../README.md)

</div>

---

## 🎯 Ne İşe Yarar?

<p align="center">
  <img src="https://img.shields.io/badge/📱-Native%20Performans-10B981?style=for-the-badge" alt="Native" />
  <img src="https://img.shields.io/badge/📲-iOS%20&%20Android-3B82F6?style=for-the-badge" alt="iOS Android" />
  <img src="https://img.shields.io/badge/🔔-Push%20Bildirim-8B5CF6?style=for-the-badge" alt="Push" />
  <img src="https://img.shields.io/badge/📴-Offline%20Desteği-F59E0B?style=for-the-badge" alt="Offline" />
</p>

> Avukatların iOS ve Android cihazlardan kullanabileceği **native mobil uygulama**. Offline çalışma, push bildirimler ve hızlı erişim.

---

## ✨ Özellikler

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| 📱 **Native Performans** | iOS ve Android için optimize | 🔄 |
| 🔔 **Push Bildirimler** | FCM ile anlık bildirimler | 🔄 |
| 📴 **Offline Çalışma** | İnternet olmadan da çalışır | 🔄 |
| 🔐 **Face ID / Fingerprint** | Biyometrik giriş | 🔄 |
| 📊 **Dashboard** | İstatistikler, yaklaşan duruşmalar | 🔄 |
| 📋 **Dava Yönetimi** | Listeleme, filtreleme, arama | 🔄 |
| 📅 **Takvim** | Duruşma ve hatırlatıcı takvimi | 🔄 |
| 🔔 **Bildirimler** | 5 gün kuralı, tebligatlar | 🔄 |
| ⚖️ **Tevkil** | Tevkil pazarı, başvuru yönetimi | 🔄 |
| 📸 **Fotoğraf Çek** | Belge tarama, fotoğraf yükleme | 🔄 |
| 📍 **Konum** | Mahkeme konumu, yol tarifi | 🔄 |

---

## 🏗️ Teknoloji Stack

<div align="left">

![React Native](https://img.shields.io/badge/-React%20Native-000000?style=for-the-badge&logo=React&logoColor=white)
![Expo](https://img.shields.io/badge/-Expo-000020?style=for-the-badge&logo=Expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![Zustand](https://img.shields.io/badge/-Zustand-F59E0B?style=for-the-badge&logo=Zustand&logoColor=white)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=ReactQuery&logoColor=white)
![React Navigation](https://img.shields.io/badge/-React%20Navigation-000000?style=for-the-badge&logo=ReactNavigation&logoColor=white)
![Jest](https://img.shields.io/badge/-Jest-C21325?style=for-the-badge&logo=Jest&logoColor=white)

</div>

---

## 📁 Klasör Yapısı

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Auth screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── otp.tsx
│   │
│   ├── (tabs)/            # Tab navigation
│   │   ├── _layout.tsx    # Tab layout
│   │   ├── index.tsx      # Dashboard
│   │   ├── cases.tsx      # Cases list
│   │   ├── calendar.tsx   # Calendar
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   │
│   ├── case/
│   │   └── [id].tsx       # Case detail
│   │
│   ├── delegation/
│   │   ├── index.tsx      # Delegation marketplace
│   │   └── [id].tsx       # Delegation detail
│   │
│   └── _layout.tsx        # Root layout
│
├── src/
│   ├── components/
│   │   ├── ui/           # Base components
│   │   ├── forms/        # Form components
│   │   └── features/     # Feature components
│   │
│   ├── services/
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth service
│   │   └── notifications.ts
│   │
│   ├── stores/           # Zustand stores
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Helpers
│   └── types/            # TypeScript types
│
├── assets/               # Images, fonts
├── ios/                  # iOS native code
├── android/              # Android native code
└── package.json
```

---

## 📱 Ekranlar

| Ekran | Route | Açıklama |
|-------|-------|----------|
| 🏠 **Splash** | - | App loading |
| 🔐 **Login** | `/login` | Telefon + OTP |
| 📝 **Register** | `/register` | Yeni kayıt |
| 🔢 **OTP** | `/otp` | Doğrulama kodu |
| 📊 **Dashboard** | `/(tabs)` | Ana panel |
| 📋 **Davalarım** | `/cases` | Dava listesi |
| 📁 **Dava Detay** | `/case/:id` | Dosya, AI özet |
| 📅 **Takvim** | `/calendar` | Takvim view |
| 🔔 **Bildirimler** | `/notifications` | Tebligatlar |
| ⚖️ **Tevkil** | `/delegation` | Pazar yeri |
| 📄 **Belge** | `/documents` | RAG arama |
| 💳 **Ödemeler** | `/payments` | Abonelik |
| 👤 **Profil** | `/profile` | Ayarlar |

---

## 🎨 UI/UX Tasarım

### Tasarım Sistemi

| Element | Değer |
|---------|-------|
| **Framework** | React Native Paper |
| **Theme** | Custom light/dark |
| **Icons** | @expo/vector-icons |
| **Fonts** | System fonts |

### Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| 🟦 Primary | `#3B82F6` | Butonlar, linkler |
| 🟩 Success | `#10B981` | Başarılı |
| 🟨 Warning | `#F59E0B` | Uyarılar |
| 🟥 Error | `#EF4444` | Hatalar |
| ⬛ Dark | `#1F2937` | Metin |
| ⬜ Light | `#F9FAFB` | Arka plan |

---

## 🔧 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Xcode (iOS için)
- Android Studio (Android için)
- Expo CLI (`npm install -g expo-cli`)

### Adımlar

```bash
# 1. Projeyi klonla
git clone https://github.com/vadi360/Refik.git
cd Refik/mobile

# 2. Bağımlılıkları yükle
npm install

# 3. Environment
cp .env.example .env
# NEXT_PUBLIC_API_URL=https://api.refik.app/api/v1

# 4. Expo ile başlat
npx expo start

# 5. iOS simulator
npx expo run:ios

# 6. Android emulator
npx expo run:android
```

### Build

```bash
# iOS (requires Apple Developer account)
eas build --platform ios

# Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📱 Native Modüller

| Modül | Kullanım |
|-------|----------|
| **expo-secure-store** | Token saklama |
| **expo-notifications** | Push bildirimler |
| **expo-location** | Konum servisi |
| **expo-camera** | Belge tarama |
| **expo-image-picker** | Fotoğraf seçimi |
| **expo-facebook** | Social login (opsiyonel) |
| **react-native-biometrics** | Face ID / Fingerprint |

---

## 📡 API Entegrasyonu

```typescript
import { refikApi } from '@/services/api';

// Auth
refikApi.post('/auth/login', { phone, password })
refikApi.post('/auth/verify-otp', { phone, code })

// Cases
refikApi.get('/cases')
refikApi.get('/cases/:id')

// Notifications
refikApi.get('/notifications')

// Calendar
refikApi.get('/calendar/this-week')
```

---

## 🔔 Push Bildirimleri

```typescript
// FCM entegrasyonu
import * as Notifications from 'expo-notifications';

// Bildirim izni al
const { status } = await Notifications.requestPermissionsAsync();

// Token al (backend'e kaydet)
const token = (await Notifications.getExpoPushTokenAsync()).data;
```

---

## 📄 Lisans

**MIT License** - Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

---

<div align="center">

**Vadi360** tarafından 💜 ile geliştirildi

[refik.app](https://refik.app) | [github.com/vadi360](https://github.com/vadi360)

</div>