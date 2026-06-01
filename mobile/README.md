# Refik Mobil Uygulaması

<div align="center">

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**Proje:** Refik - Mobil Uygulama (iOS + Android)  
**GitHub:** https://github.com/vadi360/Refik

*Mobil öncelikli, AI destekli hukuk asistanı - iOS & Android*

---

| Durum | Değer |
|-------|-------|
| Framework | React Native (Expo) |
| Language | TypeScript 5.3 |
| iOS | 13+ |
| Android | API 24+ (Android 7.0+) |
| State | Zustand |
| Navigation | React Navigation 6 |

</div>

---

## 📋 İçindekiler

1. [Hakkında](#1-hakkında)
2. [Özellikler](#2-özellikler)
3. [Teknoloji Stack](#3-teknoloji-stack)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Ekranlar](#5-ekranlar)
6. [Bileşenler](#6-bileşenler)
7. [Navigasyon](#7-navigasyon)
8. [API Entegrasyonu](#8-api-entegrasyonu)
9. [State Management](#9-state-management)
10. [Native Modüller](#10-native-modüller)
11. [Kurulum](#11-kurulum)
12. [Build & Deploy](#12-build--deploy)

---

## 1. Hakkında

Refik Mobil Uygulaması, avukatların iOS ve Android cihazlardan kullanabileceği native mobil uygulamadır. React Native (Expo) ile geliştirilmiş, offline çalışma desteği ve push bildirimleri sunmaktadır.

### Temel Özellikler

- **Native Performans** — iOS ve Android için optimize
- **Offline Desteği** — İnternet olmadan temel özellikler
- **Push Bildirimleri** — FCM (Android) ve APNs (iOS)
- **Face ID / Touch ID** — Biyometrik giriş desteği
- **Haptic Feedback** — Dokunma geri bildirimi

---

## 2. Özellikler

### 2.1 Kimlik Doğrulama

| Özellik | Açıklama |
|---------|----------|
| Telefon ile Kayıt | OTP doğrulamalı kayıt |
| Şifre ile Giriş | Email + şifre |
| Biyometrik | Face ID / Touch ID |
| PIN Koruması | 4-6 haneli PIN |
| Oturum Yönetimi | JWT token, refresh |

### 2.2 Dashboard

| Widget | Açıklama |
|--------|----------|
| Merhaba Kartı | Kullanıcı adı, günün özeti |
| Yaklaşan Duruşmalar | Bugün/bu hafta duruşmaları |
| Süre Uyarıları | Kritik süre takibi |
| Son Tebligatlar | Son gelen tebligatlar |
| Hızlı Eylemler | Dilekçe, dava ekle, tevkil |

### 2.3 Dava Yönetimi

| Özellik | Açıklama |
|---------|----------|
| Dava Listesi | Arama, filtre, sıralama |
| Dava Detay | Taraflar, duruşmalar, belgeler |
| Yeni Dava | Form ile oluşturma |
| Duruşma Hatırlatıcı | Bildirim ayarları |
| Dosya Görüntüleme | PDF, Word online görüntüleme |

### 2.4 Tebligat Yönetimi (UETS)

| Özellik | Açıklama |
|---------|----------|
| Tebligat Listesi | Okundu/bekleyen/süreli |
| AI Özet | notification_summary |
| Süre Çıkarımı | deadline_extract |
| Dava Bağlama | Tek tıkla bağlama |
| Takvim Görünümü | Tarih bazlı listeleme |

### 2.5 Tevkil

| Özellik | Açıklama |
|---------|----------|
| Tevkil Oluştur | Harita ile konum seçimi |
| Avukat Bul | Filtreleme, harita görünümü |
| Bildirim | Yeni tevkil bildirimi |
| Onay/Red | Gelen tevkilleri yönet |
| Değerlendirme | 5 yıldız + yorum |

### 2.6 AI Asistan

| Özellik | Açıklama |
|---------|----------|
| Sohbet | Genel soru-cevap |
| Dilekçe Üretici | Adım adım form |
| Emsal Araştırma | RAG destekli |
| Karar Analizi | Fotoğraf çek analiz et |

### 2.7 Takvim

| Özellik | Açıklama |
|---------|----------|
| Gün/Hafta/Ay | Farklı görünümler |
| Renk Kodlaması | Dava türüne göre |
| Bildirimler | Özelleştirilebilir |
| ICS Export | Takvim uygulamasına aktar |

### 2.8 İcra Takibi

| Özellik | Açıklama |
|---------|----------|
| Dosya Listesi | Toplu takip |
| Durum Takibi | Ödeme, satış, durdurma |
| Hatırlatıcı | Ödeme hatırlatıcıları |

### 2.9 Bildirimler & Ayarlar

| Özellik | Açıklama |
|---------|----------|
| Push Bildirimleri | FCM + APNs |
| Bildirim Tercihleri | Kanal başına ayar |
| Profil Düzenle | Ad, soyad, avatar |
| Abonelik | Paket, token kullanımı |
| Çıkış | Güvenli çıkış |

---

## 3. Teknoloji Stack

### 3.1 Core Teknolojiler

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | React Native | 0.73.x |
| Runtime | Expo | 50.x |
| Language | TypeScript | 5.3 |
| Navigation | React Navigation | 6.x |
| State | Zustand | 4.x |
| Forms | React Hook Form | 7.x |

### 3.2 Ek Kütüphaneler

| Kütüphane | Kullanım |
|-----------|----------|
| @react-native-async-storage/async-storage | Local storage |
| react-native-mmkv | Hızlı key-value storage |
| expo-notifications | Push bildirimleri |
| expo-secure-store | Güvenli token depolama |
| expo-local-authentication | Biyometrik |
| expo-image-picker | Fotoğraf seçimi |
| react-native-svg | SVG görselleri |
| date-fns | Tarih işlemleri |
| zod | Schema validation |
| @tanstack/react-query | Server state |
| react-native-gifted-chat | Sohbet UI |
| react-native-calendars | Takvim |
| react-native-maps | Harita |
| lottie-react-native | Animasyonlar |
| react-native-reanimated | Animasyonlar |

### 3.3 DevTools

| Araç | Kullanım |
|------|----------|
| Expo CLI | Geliştirme, build |
| EAS Build | Cloud build |
| EAS Submit | Store submission |
| TypeScript | Tip kontrolü |

---

## 4. Klasör Yapısı

```
mobile/
├── src/
│   ├── screens/                   # Ekran bileşenleri
│   │   ├── auth/                 # Auth ekranları
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── OtpScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── main/                  # Ana uygulama ekranları
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── CasesScreen.tsx
│   │   │   ├── CaseDetailScreen.tsx
│   │   │   ├── CaseFormScreen.tsx
│   │   │   ├── HearingsScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── NotificationDetailScreen.tsx
│   │   │   ├── DelegationsScreen.tsx
│   │   │   ├── NewDelegationScreen.tsx
│   │   │   ├── DelegationDetailScreen.tsx
│   │   │   ├── DocumentsScreen.tsx
│   │   │   ├── DocumentViewerScreen.tsx
│   │   │   ├── CalendarScreen.tsx
│   │   │   ├── IcraScreen.tsx
│   │   │   ├── IcraDetailScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   └── ai/                    # AI ekranları
│   │       ├── AiChatScreen.tsx
│   │       ├── DocumentGeneratorScreen.tsx
│   │       ├── LegalResearchScreen.tsx
│   │       └── ImageAnalysisScreen.tsx
│   │
│   ├── components/               # Paylaşılan bileşenler
│   │   ├── ui/                    # Base UI bileşenleri
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── cards/                # Kart bileşenleri
│   │   │   ├── CaseCard.tsx
│   │   │   ├── HearingCard.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   ├── DelegationCard.tsx
│   │   │   ├── LawyerCard.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   └── IcraCard.tsx
│   │   │
│   │   ├── lists/                # Liste bileşenleri
│   │   │   ├── CaseList.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── DelegationList.tsx
│   │   │
│   │   ├── forms/                # Form bileşenleri
│   │   │   ├── CaseForm.tsx
│   │   │   ├── DelegationForm.tsx
│   │   │   └── SearchInput.tsx
│   │   │
│   │   └── layout/              # Layout bileşenleri
│   │       ├── Header.tsx
│   │       ├── BottomTab.tsx
│   │       ├── SafeArea.tsx
│   │       └── LoadingOverlay.tsx
│   │
│   ├── navigation/               # Navigasyon
│   │   ├── AppNavigator.tsx       # Root navigator
│   │   ├── AuthNavigator.tsx      # Auth stack
│   │   ├── MainNavigator.tsx     # Main tab + stack
│   │   ├── AiNavigator.tsx       # AI stack
│   │   └── types.ts              # Navigation tipleri
│   │
│   ├── services/                 # API servisleri
│   │   ├── api.ts                 # Axios instance
│   │   ├── auth.service.ts        # Auth API
│   │   ├── cases.service.ts        # Dava API
│   │   ├── notifications.service.ts # Tebligat API
│   │   ├── delegations.service.ts  # Tevkil API
│   │   ├── ai.service.ts          # AI API
│   │   ├── calendar.service.ts    # Takvim API
│   │   ├── icra.service.ts        # İcra API
│   │   └── storage.service.ts      # Local storage
│   │
│   ├── store/                    # State management
│   │   ├── store.ts               # Store root
│   │   ├── authSlice.ts           # Auth state
│   │   ├── casesSlice.ts          # Dava state
│   │   ├── notificationsSlice.ts   # Tebligat state
│   │   ├── delegationsSlice.ts     # Tevkil state
│   │   ├── aiSlice.ts              # AI state
│   │   └── uiSlice.ts              # UI state
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCases.ts
│   │   ├── useNotifications.ts
│   │   ├── useDelegations.ts
│   │   ├── useAI.ts
│   │   ├── useCalendar.ts
│   │   ├── usePushNotifications.ts
│   │   └── useBiometric.ts
│   │
│   ├── utils/                    # Yardımcı fonksiyonlar
│   │   ├── date.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── constants/                # Sabitler
│   │   ├── colors.ts              # Renk paleti
│   │   ├── spacing.ts             # Spacing
│   │   ├── typography.ts          # Font stilleri
│   │   └── config.ts               # App config
│   │
│   ├── types/                    # TypeScript tipleri
│   │   ├── auth.types.ts
│   │   ├── case.types.ts
│   │   ├── notification.types.ts
│   │   ├── delegation.types.ts
│   │   ├── ai.types.ts
│   │   └── index.ts
│   │
│   └── assets/                   # Görseller, fontlar
│       ├── images/
│       ├── icons/
│       ├── fonts/
│       └── animations/
│
├── ios/                           # iOS native kod
│   ├── Refik/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   └── Refik.entitlements
│   ├── Refik.xcodeproj
│   └── Refik.xcworkspace
│
├── android/                      # Android native kod
│   └── app/
│       ├── src/main/
│       │   ├── java/com/refik/
│       │   │   ├── MainApplication.kt
│       │   │   └── MainActivity.kt
│       │   └── AndroidManifest.xml
│       └── build.gradle
│
├── App.tsx                       # Uygulama giriş noktası
├── index.js                     # Metro bundler giriş
├── app.json                     # Expo config
├── babel.config.js              # Babel config
├── metro.config.js              # Metro config
├── tsconfig.json                # TypeScript config
├── package.json
└── README.md                     # (bu dosya)
```

---

## 5. Ekranlar

### 5.1 Auth Ekranları

| Ekran | Route | Açıklama |
|-------|-------|----------|
| SplashScreen | - | Açılış, token kontrolü |
| LoginScreen | /login | Email + şifre girişi |
| RegisterScreen | /register | Adım adım kayıt |
| OtpScreen | /otp | SMS OTP doğrulama |
| ForgotPasswordScreen | /forgot-password | Şifre sıfırlama |

### 5.2 Main Ekranları

| Ekran | Route | Açıklama |
|-------|-------|----------|
| DashboardScreen | /dashboard | Ana panel |
| CasesScreen | /cases | Dava listesi |
| CaseDetailScreen | /cases/:id | Dava detay |
| CaseFormScreen | /cases/new | Yeni dava formu |
| HearingsScreen | /hearings | Duruşmalar |
| NotificationsScreen | /notifications | Tebligatlar |
| NotificationDetailScreen | /notifications/:id | Tebligat detay |
| DelegationsScreen | /delegations | Tevkiller |
| NewDelegationScreen | /delegations/new | Yeni tevkil |
| DelegationDetailScreen | /delegations/:id | Tevkil detay |
| DocumentsScreen | /documents | Belgeler |
| DocumentViewerScreen | /documents/:id | Belge görüntüleme |
| CalendarScreen | /calendar | Takvim |
| IcraScreen | /icra | İcra takibi |
| IcraDetailScreen | /icra/:id | İcra detay |
| ProfileScreen | /profile | Profil |

### 5.3 AI Ekranları

| Ekran | Route | Açıklama |
|-------|-------|----------|
| AiChatScreen | /ai/chat | AI sohbet |
| DocumentGeneratorScreen | /ai/generate | Dilekçe üretici |
| LegalResearchScreen | /ai/research | Emsal araştırma |
| ImageAnalysisScreen | /ai/analyze | Karar analizi |

---

## 6. Bileşenler

### 6.1 UI Bileşenleri

```
components/ui/
├── Button.tsx          # Variants: primary, secondary, outline, ghost
├── Input.tsx           # Variants: default, error, success
├── Select.tsx          # Dropdown select
├── Modal.tsx           # Bottom sheet, center modal
├── Card.tsx            # Elevated card
├── Badge.tsx           # Status badge
├── Avatar.tsx          # User avatar
├── Skeleton.tsx        # Loading placeholder
├── Spinner.tsx         # Loading spinner
├── Toast.tsx           # Toast notification
└── Chip.tsx            # Tag/Chip
```

### 6.2 Card Bileşenleri

```
components/cards/
├── CaseCard.tsx         # Dava kartı
├── HearingCard.tsx     # Duruşma kartı
├── NotificationCard.tsx # Tebligat kartı
├── DelegationCard.tsx  # Tevkil kartı
├── LawyerCard.tsx       # Avukat kartı
├── DocumentCard.tsx     # Belge kartı
└── IcraCard.tsx         # İcra kartı
```

### 6.3 Layout Bileşenleri

```
components/layout/
├── Header.tsx           # App header
├── BottomTab.tsx        # Bottom tab bar
├── SafeArea.tsx         # Safe area wrapper
└── LoadingOverlay.tsx   # Full screen loader
```

---

## 7. Navigasyon

### 7.1 Navigator Yapısı

```
AppNavigator
├── AuthNavigator (Stack)
│   ├── SplashScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── OtpScreen
│   └── ForgotPasswordScreen
│
├── MainNavigator (Tab + Stack)
│   ├── DashboardTab (Stack)
│   │   └── DashboardScreen
│   │
│   ├── CasesTab (Stack)
│   │   ├── CasesScreen
│   │   ├── CaseDetailScreen
│   │   └── CaseFormScreen
│   │
│   ├── NotificationsTab (Stack)
│   │   ├── NotificationsScreen
│   │   └── NotificationDetailScreen
│   │
│   ├── DelegationsTab (Stack)
│   │   ├── DelegationsScreen
│   │   ├── NewDelegationScreen
│   │   └── DelegationDetailScreen
│   │
│   └── ProfileTab (Stack)
│       └── ProfileScreen
│
└── AiNavigator (Stack)
    ├── AiChatScreen
    ├── DocumentGeneratorScreen
    ├── LegalResearchScreen
    └── ImageAnalysisScreen
```

### 7.2 Navigation Tipleri

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Ai: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { phone: string };
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Cases: undefined;
  Notifications: undefined;
  Delegations: undefined;
  Profile: undefined;
};

export type CasesStackParamList = {
  CasesList: undefined;
  CaseDetail: { caseId: string };
  CaseForm: { caseId?: string };
};

export type AiStackParamList = {
  AiChat: undefined;
  DocumentGenerator: undefined;
  LegalResearch: undefined;
  ImageAnalysis: undefined;
};
```

---

## 8. API Entegrasyonu

### 8.1 API Servis Yapısı

```typescript
// services/api.ts
const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 30000,
});

api.interceptors.request.use(async config => {
  const token = await SecureStore.getTokenAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 8.2 Servis Listesi

| Servis | Metodlar |
|--------|----------|
| `authService` | login, register, verifyOtp, forgotPassword, refreshToken |
| `casesService` | getCases, getCaseById, createCase, updateCase, deleteCase |
| `notificationsService` | getNotifications, markRead, addReminder, linkToCase |
| `delegationsService` | create, accept, reject, rate, complain |
| `aiService` | chat, summarize, extractDeadline, generateDocument, research |
| `calendarService` | getItems, getThisWeek, getThisMonth, getUpcoming |
| `icraService` | getFiles, getFileById, addPayment, detectAssets |

---

## 9. State Management

### 9.1 Zustand Store

```typescript
// store/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// store/casesSlice.ts
interface CasesState {
  cases: Case[];
  selectedCase: Case | null;
  isLoading: boolean;
  fetchCases: () => Promise<void>;
  createCase: (data: CaseData) => Promise<void>;
}
```

### 9.2 Store Listesi

| Store | Açıklama |
|-------|----------|
| `authStore` | Kullanıcı, token, auth durumu |
| `casesStore` | Dava listesi, seçili dava |
| `notificationsStore` | Tebligat listesi |
| `delegationsStore` | Tevkil listesi |
| `aiStore` | AI sohbet geçmişi |
| `uiStore` | Loading, modal, tema |

---

## 10. Native Modüller

### 10.1 Expo Modülleri

| Modül | Kullanım |
|-------|----------|
| expo-secure-store | Token depolama |
| expo-notifications | Push bildirimleri |
| expo-local-authentication | Face ID / Touch ID |
| expo-image-picker | Fotoğraf seçimi |
| expo-camera | Kamera erişimi |
| expo-file-system | Dosya işlemleri |
| expo-sharing | Paylaşım |

### 10.2 Custom Native Modüller

| Modül | Platform | Kullanım |
|-------|----------|----------|
| BiometricAuth | iOS/Android | Face ID / Fingerprint |
|PdfViewer | iOS/Android | PDF görüntüleme |
| CalendarIntegration | iOS/Android | Sistem takvimi |

---

## 11. Kurulum

### 11.1 Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI (`npm install -g expo-cli`)
- Xcode (iOS build için)
- Android Studio (Android build için)

### 11.2 Kurulum Adımları

```bash
# 1. Projeye git
cd Refik/mobile

# 2. Bağımlılıkları yükle
npm install

# 3. Environment oluştur
cp .env.example .env
# .env düzenle

# 4. Prebuild (native kod için)
npx expo prebuild

# 5. iOS için
cd ios && pod install && cd ..

# 6. Geliştirme sunucusu başlat
npx expo start
```

### 11.3 Environment Değişkenleri

```bash
API_URL=http://localhost:3000/api/v1
ENVIRONMENT=development
```

---

## 12. Build & Deploy

### 12.1 Expo EAS Build

```bash
# iOS Build
eas build --platform ios --profile preview

# Android Build
eas build --platform android --profile preview

# Production Build
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 12.2 Manuel Build

```bash
# iOS (Xcode)
cd ios
xcodebuild -workspace Refik.xcworkspace -scheme Refik -configuration Release archive

# Android (Gradle)
cd android
./gradlew assembleRelease
```

### 12.3 Store Submission

```bash
# iOS (App Store)
eas submit --platform ios --latest

# Android (Play Store)
eas submit --platform android --latest
```

---

## 13. Performans İyileştirmeleri

### 13.1 Bundle Optimizasyonu

- Code splitting (her ekran için ayrı bundle)
- Lazy loading (lazy import)
- Tree shaking (kullanılmayan kod eleme)

### 13.2 Render İyileştirmeleri

- React.memo() ile bileşen memoization
- useCallback ve useMemo kullanımı
- FlatList ile virtualized listeler

### 13.3 Offline Stratejisi

- MMKV ile hızlı local cache
- Optimistic updates (arka planda güncelleme)
- Background sync (uygulama kapalıyken senkron)

---

<div align="center">

*Refik Mobil Uygulaması*

*© 2026 Refik. Tüm hakları saklıdır.*

</div>