# Refik — Uygulama Planı
## Frontend Ekranlar, Backend Mimarisi, Veritabanı & API Tasarımı

**Versiyon:** 2.0  
**Tarih:** 02 Haziran 2026
**Durum:** Backend Tamamlandı - Frontend Planlama
**GitHub:** https://github.com/vadi360/Refik
**Git Commit:** b76d796

---

# BÖLÜM 1: FRONTEND MİMARİSİ

## 1.1 Uygulama Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AVRUKATPRO FRONTEND                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   WEB APP    │  │  MOBIL APP   │  │   CHROME     │             │
│  │  (Next.js)   │  │(React Native)│  │   EKLENTI    │             │
│  │    (PWA)     │  │ iOS/Android  │  │ (Manifest V3)│             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                      │
│         └─────────────────┼─────────────────┘                      │
│                           │                                        │
│                           ▼                                        │
│              ┌────────────────────────┐                            │
│              │     ORTAK API LAYERI    │                            │
│              │    (REST / GraphQL)    │                            │
│              └────────────────────────┘                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 1.2 Platform Karşılaştırması

| Özellik | Web (PWA) | Mobil (React Native) | Chrome Eklenti |
|---------|-----------|---------------------|----------------|
| **Temel kullanım** | Ofis/evde | Dışarıda/mahkemede | UYAP gezinirken |
| **Tevkil verme** | ✅ Tam | ✅ Tam | ❌ |
| **Tebligat takibi** | ✅ Tam | ✅ Tam | ❌ |
| **UYAP özet** | ✅ Temel | ✅ Temel | ✅ Tam |
| **Dilekçe üretimi** | ✅ Tam | ✅ Tam | ❌ |
| **Bildirimler** | ✅ | ✅ | ❌ |
| **Offline destek** | ⚠️ Sınırlı | ✅ | ❌ |
| **Kamera/gallery** | ❌ | ✅ | ❌ |

---

# BÖLÜM 2: WEB UYGULAMASI (Next.js + PWA)

## 2.1 Ekran Yapısı (Site Haritası)

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEB UYGULAMASI                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────┐                                                     │
│   │ GİRİŞ   │ ←─── /login                                        │
│   └────┬────┘                                                     │
│        │                                                          │
│        ▼                                                          │
│   ┌─────────┐                                                     │
│   │ KAYIT   │ ←─── /register                                      │
│   └────┬────┘                                                     │
│        │                                                          │
│        ▼                                                          │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │                    ANA DASHBOARD                          │    │
│   │  ┌─────────┬──────────┬───────────┬──────────┐           │    │
│   │  │Dashboard│ Dosyalar │ Tebligatlar│ Tevkiller│ ...      │    │
│   │  └─────────┴──────────┴───────────┴──────────┘           │    │
│   │                                                          │    │
│   │  /dashboard - Ana panel                                  │    │
│   │  /files - Dosya listesi                                  │    │
│   │  /notifications - Tebligatlar                             │    │
│   │  /delegations - Tevkillerim                             │    │
│   │  /documents - Üretilen belgeler                          │    │
│   │  /profile - Profil ayarları                              │    │
│   │  /settings - Uygulama ayarları                           │    │
│   │                                                          │    │
│   │  + ADMIN PANEL:                                          │    │
│   │  /admin - Yönetim paneli                                 │    │
│   │  /admin/users - Kullanıcı yönetimi                        │    │
│   │  /admin/ai-config - AI yapılandırma                      │    │
│   │  /admin/analytics - İstatistikler                        │    │
│   │                                                          │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Ekran Detayları

### 2.2.1 Giriş Ekranı (/login)

```
┌─────────────────────────────────────────────────────────────┐
│                      GİRİŞ EKRANI                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [Logo]                                    │
│                   Refik                                   │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  E-posta adresi                     │             │
│         │  john@example.com                    │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  Şifre                               │             │
│         │  ••••••••                            │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         [ ] Beni hatırla                                     │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │            GİRİŞ YAP                 │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         Şifremi unuttum    |    Kayıt ol                     │
│                                                             │
│         ─────────────────────────────────────               │
│         veya                                                    │
│         Google ile giriş    Apple ile giriş                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| email | string | ✅ | Kullanıcı e-postası |
| password | string | ✅ | Şifre |
| remember_me | boolean | ❌ | Oturum hatırlama |

**Bileşenler:**
- Logo
- Email input
- Password input (show/hide toggle)
- Remember me checkbox
- Submit button
- Social login buttons (Google, Apple)
- Forgot password link
- Register link

---

### 2.2.2 Kayıt Ekranı (/register)

```
┌─────────────────────────────────────────────────────────────┐
│                      KAYIT EKRANI                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [Logo]                                    │
│                   Refik                                   │
│                                                             │
│         Aşağıdaki bilgileri doldurarak kayıt olun           │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  Ad Soyad                           │             │
│         │  John Doe                            │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  E-posta adresi                     │             │
│         │  john@example.com                    │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  Telefon numarası                   │             │
│         │  +90 532 123 45 67                  │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  Şifre                               │             │
│         │  ••••••••                            │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │  Şifre tekrar                       │             │
│         │  ••••••••                            │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         [ ] KVKK metnini okudum ve kabul ediyorum          │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │          KAYIT OL                    │             │
│         └─────────────────────────────────────┘             │
│                                                             │
│         Zaten hesabınız var mı? Giriş yap                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| name | string | ✅ | Ad soyad |
| email | string | ✅ | E-posta |
| phone | string | ✅ | Telefon (Türkiye formatı) |
| password | string | ✅ | Şifre (min 8 karakter) |
| password_confirm | string | ✅ | Şifre tekrar |
| kvkk_consent | boolean | ✅ | KVKK onayı |

**Bileşenler:**
- Form inputs (name, email, phone, password, confirm)
- Phone input with Turkey country code (+90)
- Password strength indicator
- KVKK checkbox with link to full text
- Submit button
- Login link

---

### 2.2.3 Ana Dashboard (/dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD EKRANI                           │
├─────────────────────────────────────────────────────────────┤
│ [Logo]  Refik           [🔔] [👤]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 📁         │ │ 📋         │ │ ⚠️         │            │
│  │ Aktif      │ │ Bekleyen   │ │ Süresi     │            │
│  │ Dosyalar   │ │ Tevkiller  │ │ Yaklaşan   │            │
│  │   12       │ │    3       │ │   5        │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  YAKLAŞAN DURUŞMALAR                                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  📅 15.06.2026 - İstanbul Asliye Hukuk               │  │
│  │     Davacı: Ahmet Yılmaz vs. Mehmet Demir             │  │
│  │     Saat: 10:00 | Durum: Aktif                        │  │
│  │     [Tevkil Ver] [Detay]                             │  │
│  │                                                       │  │
│  │  📅 16.06.2026 - Ankara Aile Mahkemesi               │  │
│  │     Davacı: Ayşe Kaya vs. Ali Öztürk                  │  │
│  │     Saat: 14:30 | Durum: Aktif                        │  │
│  │     [Tevkil Ver] [Detay]                             │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SON TEBLİGATLAR                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  📨 Ara Karar - İstanbul 5. Asliye Hukuk              │  │
│  │     14 gün içinde itiraz süresi                      │  │
│  │     2 saat önce                                      │  │
│  │     [İncele] [Hatırlat]                              │  │
│  │                                                       │  │
│  │  📨 Duruşma Günü - Ankara 2. Aile Hukuk              │  │
│  │     20.06.2026 tarihine ertelendi                    │  │
│  │     1 gün önce                                       │  │
│  │     [İncele] [Hatırlat]                              │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HIZLI İŞLEMLER                                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  [+ Yeni Dilekçe]  [+ Tevkil Ver]  [+ Dosya Ekle]   │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Açıklama |
|------|-----|----------|
| stats.active_files | number | Aktif dosya sayısı |
| stats.pending_delegations | number | Bekleyen tevkil sayısı |
| stats.upcoming_deadlines | number | Yaklaşan süre sayısı |
| hearings[] | array | Yaklaşan duruşmalar |
| notifications[] | array | Son tebligatlar |

**Bileşenler:**
- Stats cards (4 adet)
- Upcoming hearings list
- Recent notifications list
- Quick actions buttons
- Sidebar navigation

---

### 2.2.4 Dosyalarım Ekranı (/files)

```
┌─────────────────────────────────────────────────────────────┐
│                      DOSYALARIM EKRANI                        │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Dosya ara...]  [+ Yeni Dosya]  [Filtrele ▼]            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TÜM DOSYALAR (23)                                         │
│  ───────────────────────────────────────                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📁 2024/001 - İstanbul Asliye Hukuk                   │  │
│  │    Taraflar: Ahmet Yılmaz vs. Mehmet Demir           │  │
│  │    Konu: Alacak Davası                               │  │
│  │    Durum: Aktif | Duruşma: 15.06.2026                │  │
│  │    Son İşlem: 2 saat önce                            │  │
│  │    [Detay] [Tevkil Ver] [Belge Ekle]                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📁 2024/002 - Ankara Aile Mahkemesi                  │  │
│  │    Taraflar: Ayşe Kaya vs. Ali Öztürk                │  │
│  │    Konu: Boşanma                                     │  │
│  │    Durum: Aktif | Duruşma: 16.06.2026                │  │
│  │    Son İşlem: 1 gün önce                             │  │
│  │    [Detay] [Tevkil Ver] [Belge Ekle]                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📁 2023/045 - İzmir İcra Hukuk Mahkemesi            │  │
│  │    Konu: İcra Takibi                                  │  │
│  │    Durum: Kapalı | Sonuç: Alacak ödendi              │  │
│  │    [Arşivle] [Detay]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ───────────────────────────────────────                    │
│  Sayfa: < 1 2 3 4 5 >                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Açıklama |
|------|-----|----------|
| files[] | array | Dosya listesi |
| files[].id | uuid | Dosya ID |
| files[].case_number | string | Dosya numarası |
| files[].court | string | Mahkeme adı |
| files[].parties | string | Taraflar |
| files[].subject | string | Konu |
| files[].status | enum | Aktif, Kapalı, Arşivlenmiş |
| files[].next_hearing | date | Sonraki duruşma |
| files[].created_at | datetime | Oluşturulma tarihi |

**Bileşenler:**
- Search bar
- New file button
- Filter dropdown (status, court, date)
- File list (cards)
- Pagination
- Quick actions per file

---

### 2.2.5 Dosya Detay Ekranı (/files/[id])

```
┌─────────────────────────────────────────────────────────────┐
│                  DOSYA DETAY EKRANI                          │
├─────────────────────────────────────────────────────────────┤
│ [← Geri]                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 2024/001 - İstanbul Asliye Hukuk                         │
│  Alacak Davası                                               │
│  ───────────────────────────────────────                    │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ DURUM        │ │ MAHKEME      │ │ SÜRE         │         │
│  │ Aktif        │ │ İstanbul 5.  │ │ 12 gün kaldı│         │
│  │              │ │ Asliye Hukuk │ │ (itiraz)    │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TARAFLAR                                             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Davacı: Ahmet Yılmaz (Tehlike 1: 0532 123 45 67)   │  │
│  │  Davalı: Mehmet Demir (Tehlike 2: 0533 987 65 43)   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DURUŞMALAR                                           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  📅 15.06.2026 10:00 - Duruşma (Yaklaşan)           │  │
│  │  📅 20.05.2026 14:00 - Duruşma (Geçmiş)             │  │
│  │  📅 15.04.2026 10:00 - Duruşma (Geçmiş)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI ÖZET                                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  🤖 Bu dosya hakkında:                               │  │
│  │  Alacak davası. Müvekkil Ahmet Yılmaz, davalı       │  │
│  │  Mehmet Demir'den 150.000 TL alacak talep etmekte.  │  │
│  │  Davalı itiraz etti, yargılama devam ediyor.         │  │
│  │  Son duruşmada bilirkişi raporu bekleniyor.          │  │
│  │                                                       │  │
│  │  Aleyhinize: 1 karar | Lehinize: 0 karar             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BELGELER                                             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  📄 Dava dilekçesi (12.03.2024)                      │  │
│  │  📄 İtiraz dilekçesi (25.03.2024)                    │  │
│  │  📄 Bilirkişi raporu (15.05.2024)                    │  │
│  │  [+ Belge Ekle]                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HIZLI İŞLEMLER                                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [Tevkil Ver] [Dilekçe Hazırla] [Hatırlatıcı Ekle]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Açıklama |
|------|-----|----------|
| case.id | uuid | Dosya ID |
| case.case_number | string | Dosya numarası |
| case.court | string | Mahkeme |
| case.parties | object | Taraflar (davacı, davalı) |
| case.subject | string | Konu |
| case.status | enum | Aktif, Kapalı |
| case.ai_summary | string | AI özeti |
| case.decision_analysis | object | Aleyhe/lehe analiz |
| hearings[] | array | Duruşmalar |
| documents[] | array | Belgeler |
| reminders[] | array | Hatırlatıcılar |

---

### 2.2.6 Tebligatlar Ekranı (/notifications)

```
┌─────────────────────────────────────────────────────────────┐
│                    TEBLİGATLAR EKRANI                        │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Ara...]  [Tümü ▼] [Okunmamış] [Tarih]                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OKUNMAMIŞ (8)                                              │
│  ───────────────────────────────────────                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⭐ YENİ  📋 Ara Karar                                │  │
│  │                                                         │  │
│  │  İstanbul 5. Asliye Hukuk Mahkemesi                   │  │
│  │  14 gün içinde itiraz süresi                         │  │
│  │  Gönderim: 01.06.2026 | Okundu: -                    │  │
│  │                                                         │  │
│  │  [İncele] [Hatırlat] [İlgili Dosyaya Ekle]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⭐ YENİ  📅 Duruşma Günü                             │  │
│  │                                                         │  │
│  │  Ankara 2. Aile Hukuk Mahkemesi                       │  │
│  │  20.06.2026 tarihine ertelendi                        │  │
│  │  Gönderim: 01.06.2026 | Okundu: -                    │  │
│  │                                                         │  │
│  │  [İncele] [Hatırlat] [İlgili Dosyaya Ekle]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  OKUNMUŞ (42)                                               │
│  ───────────────────────────────────────                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📋 Tahkikat İstemleri                                 │  │
│  │  5 gün içinde cevap verilmesi gerekiyor              │  │
│  │  Gönderim: 30.05.2026 | Okundu: 01.06.2026          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Açıklama |
|------|-----|----------|
| notifications[] | array | Tebligat listesi |
| notifications[].id | uuid | Tebligat ID |
| notifications[].type | enum | Ara karar, Duruşma, Süreli bildirim |
| notifications[].court | string | Mahkeme |
| notifications[].content | string | İçerik özeti |
| notifications[].deadline | date | Süre bitişi |
| notifications[].sent_date | datetime | Gönderim tarihi |
| notifications[].read_date | datetime | Okunma tarihi |
| notifications[].is_read | boolean | Okundu mu? |
| notifications[].is_starred | boolean | Yıldız işaretli mi? |
| notifications[].case_id | uuid | İlgili dosya (opsiyonel) |

---

### 2.2.7 Tevkiller Ekranı (/delegations)

```
┌─────────────────────────────────────────────────────────────┐
│                      TEVKİLLER EKRANI                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │   VERDİKLERİM (3)    │  │   ALDIKLARIM (2)    │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AKTİF TEVKİLLER                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  📤 GÖNDEREN: Ahmet Yılmaz                          │  │
│  │     Dosya: 2024/001 - Alacak Davası                  │  │
│  │     Konum: İstanbul, Kadıköy                          │  │
│  │     Tarih: 15.06.2026 10:00                           │  │
│  │     Durum: ⏳ Beklemede                               │  │
│  │     [İptal Et] [Mesaj Gönder]                        │  │
│  │                                                       │  │
│  │  ─────────────────────────────────────────           │  │
│  │                                                       │  │
│  │  📥 ALAN: Mehmet Demir                               │  │
│  │     Dosya: 2024/003 - Tazminat                       │  │
│  │     Konum: İstanbul, Bakırköy                         │  │
│  │     Tarih: 18.06.2026 14:00                           │  │
│  │     Durum: ✅ Onaylandı                               │  │
│  │     [Detay] [Tamamla]                                │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GEÇMİŞ TEVKİLLER                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  📤 → 12.05.2026 - İstanbul 3. Asliye Hukuk         │  │
│  │     Sonuç: ✅ Tamamlandı (Puan: +5)                  │  │
│  │                                                       │  │
│  │  📥 → 05.05.2026 - Ankara 1. Aile Hukuk            │  │
│  │     Sonuç: ⚠️ İptal edildi                           │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [+ YENİ TEVKİL OLUŞTUR]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Veriler:**
| Alan | Tip | Açıklama |
|------|-----|----------|
| sent_delegations[] | array | Gönderilen tevkiller |
| received_delegations[] | array | Alınan tevkiller |
| past_delegations[] | array | Geçmiş tevkiller |
| delegation.status | enum | Beklemede, Onaylandı, Reddedildi, İptal, Tamamlandı |
| delegation.from_user | object | Gönderen avukat |
| delegation.to_user | object | Alan avukat |
| delegation.case | object | İlgili dosya |
| delegation.hearing | object | Duruşma bilgisi |
| delegation.rating | number | Puan (1-5) |

---

### 2.2.8 Tevkil Oluşturma (/delegations/new)

```
┌─────────────────────────────────────────────────────────────┐
│                YENİ TEVKİL OLUŞTUR                          │
├─────────────────────────────────────────────────────────────┤
│ [← Geri]                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DAVANIZI SEÇİN                                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  📁 2024/001 - İstanbul Asliye Hukuk                 │  │
│  │     Alacak Davası | Duruşma: 15.06.2026              │  │
│  │                                                       │  │
│  │  📁 2024/002 - Ankara Aile Mahkemesi                │  │
│  │     Boşanma | Duruşma: 16.06.2026                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DURUŞMA BİLGİSİ                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Tarih: 15 Haziran 2026, 10:00                        │  │
│  │  Mahkeme: İstanbul 5. Asliye Hukuk                   │  │
│  │  Konu: Duruşma                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UZMANLIK ALANI                                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [ ] Aile Hukuku                                     │  │
│  │  [✓] Borçlar Hukuku    ← Seçili                     │  │
│  │  [ ] Ceza Hukuku                                      │  │
│  │  [ ] İş Hukuku                                       │  │
│  │  [ ] Miras Hukuku                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NOTUNUZZ (opsiyonel)                                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Müvekkil çok ısrar ediyor, lütfen dikkatli olunuz   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ÖNERİLEN AVUKATLAR                                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ⭐ 4.8  Av. Selin Kaya                               │  │
│  │     📍 İstanbul, Kadıköy | 👤 127 tevkil              │  │
│  │     ✅ 24 saat içinde yanıt garantisi                │  │
│  │     [Seç]                                            │  │
│  │                                                       │  │
│  │  ⭐ 4.6  Av. Emre Yıldız                             │  │
│  │     📍 İstanbul, Maltepe | 👤 89 tevkil               │  │
│  │     [Seç]                                            │  │
│  │                                                       │  │
│  │  ⭐ 4.5  Av. Zeynep Aktaş                            │  │
│  │     📍 İstanbul, Ataşehir | 👤 56 tevkil              │  │
│  │     [Seç]                                            │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📤 TEVKİL TALEBİ GÖNDER                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2.9 Belgelerim/Dilekçe Üretimi (/documents)

```
┌─────────────────────────────────────────────────────────────┐
│                    BELGELERİM EKRANI                         │
├─────────────────────────────────────────────────────────────┤
│ [Yeni Dilekçe]  [Filtrele ▼]                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BOŞANMA DİLEKÇESİ                                   │  │
│  │  ─────────────────────────────────────               │  │
│  │  Dosya: 2024/002 | 01.06.2026                        │  │
│  │  Durum: ✅ Onaylandı                                 │  │
│  │                                                       │  │
│  │  [Görüntüle] [İndir PDF] [İndir Word] [Kopyala]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  İHTARNAME - Kira Sözleşmesi                         │  │
│  │  ─────────────────────────────────────               │  │
│  │  Dosya: 2024/004 | 30.05.2026                        │  │
│  │  Durum: ⏳ İnceleniyor                               │  │
│  │                                                       │  │
│  │  [Görüntüle] [Düzenle] [Sil]                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  İTİRAZ DİLEKÇESİ                                    │  │
│  │  ─────────────────────────────────────               │  │
│  │  Dosya: 2024/001 | 25.03.2024                        │  │
│  │  Durum: ✅ Onaylandı                                 │  │
│  │                                                       │  │
│  │  [Görüntüle] [İndir PDF] [İndir Word]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2.10 Dilekçe Üretici (/documents/new)

```
┌─────────────────────────────────────────────────────────────┐
│                  DİLEKÇE ÜRETİCİ                            │
├─────────────────────────────────────────────────────────────┤
│ [← Geri]                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DİLEKÇE TÜRÜ                                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │Dava      │ │İhtarname │ │İtiraz    │ │İstihkak│  │  │
│  │  │Dilekçesi │ │          │ │Dilekçesi │ │Talebi  │  │  │
│  │  │   ✓     │ │          │ │          │ │        │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  │                                                       │  │
│  │  [+ Diğer türler...]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DAVA DETAYLARI                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  İlgili dosya: [2024/002 - Boşanma ▼]              │  │
│  │                                                       │  │
│  │  Davalı: Mehmet Demir                               │  │
│  │  Davalı TC: 12345678901                             │  │
│  │  Davalı Adres: İstanbul, Kadıköy...                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TALEP DETAYLARI                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  Mal Paylaşımı:                               │  │  │
│  │  │  - Dava edilen taşınmazlar listesi...        │  │  │
│  │  │  - Araçlar...                                 │  │  │
│  │  │                                               │  │  │
│  │  │  Velayet: Ortak çocuk için düzenlenecek       │  │  │
│  │  │  İstanbul Kadıköy'de bulunan 3+1 daire...    │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  Konuşma biçimi: [Resmi ▼] [Yarı Resmi ▼]        │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🤖 AI İLE ÜRET                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ───────────────────────────────────────                    │
│  AI: Minimax M2.7 (Türkiye)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2.11 Profil Ayarları (/profile)

```
┌─────────────────────────────────────────────────────────────┐
│                      PROFİL AYARLARI                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👤 AVUKAT PROFİLİ                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ┌─────────┐                                         │  │
│  │  │    📷   │  [Fotoğraf Değiştir]                   │  │
│  │  └─────────┘                                         │  │
│  │                                                       │  │
│  │  Ad Soyad: Av. John Doe                              │  │
│  │  Baro: İstanbul Barosu                               │  │
│  │  Ruhsat No: 12345                                    │  │
│  │  E-posta: john@lawfirm.com                          │  │
│  │  Telefon: +90 532 123 45 67                         │  │
│  │                                                       │  │
│  │  [Düzenle]                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📍 ÇALIŞMA BÖLGESİ                                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Şehir: İstanbul                                    │  │
│  │  İlçe: Kadıköy                                      │  │
│  │  Adliye: İstanbul 5. Asliye Hukuk                   │  │
│  │  Uzmanlık: [Aile Hukuku] [Borçlar Hukuku]          │  │
│  │                                                       │  │
│  │  [Düzenle]                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⭐ PUAN VE İNCELEME                                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Ortalama Puan: 4.8/5                               │  │
│  │  Toplam İnceleme: 127                               │  │
│  │  Başarı Oranı: %94                                  │  │
│  │                                                       │  │
│  │  Son İncelemeler:                                   │  │
│  │  "Çok profesyonel ve hızlı iletişim" - ⭐⭐⭐⭐⭐       │  │
│  │  "Duruşmaya zamanında geldi" - ⭐⭐⭐⭐⭐              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔔 BİLDİRİM AYARLARI                                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [✓] Push bildirimleri                               │  │
│  │  [✓] E-posta bildirimleri                           │  │
│  │  [✓] SMS bildirimleri                               │  │
│  │  [ ] WhatsApp bildirimleri                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔐 GÜVENLİK                                         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [Şifre Değiştir]                                   │  │
│  │  [İki Faktörlü Doğrulama]                          │  │
│  │  [Oturumları Yönet]                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2.12 Admin Panel - AI Yapılandırma (/admin/ai-config)

```
┌─────────────────────────────────────────────────────────────┐
│                 AI YAPILANDIRMA (ADMIN)                      │
├─────────────────────────────────────────────────────────────┤
│ [← Geri]  [Kaydet]                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🤖 AI MOTORLARI                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  Minimax M2.7 (Türkiye)          [✓] Aktif          │  │
│  │  ├─ API Key: ••••••••••••••••                       │  │
│  │  ├─ Durum: ✅ Bağlı                                 │  │
│  │  └─ Varsayılan: ✅                                 │  │
│  │                                                       │  │
│  │  Claude (Sonnet)                    [✓] Aktif        │  │
│  │  ├─ API Key: ••••••••••••••••                       │  │
│  │  ├─ Durum: ✅ Bağlı                                 │  │
│  │  └─ Varsayılan: ❌                                 │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📋 GÖREV ATAMALARI (Her görev için AI seçin)        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  Görev                        │ Minimax │ Claude │   │  │
│  │  ─────────────────────────────┼─────────┼────────│   │  │
│  │  Tebligat özetleme            │   ✓     │        │   │  │
│  │  Süre çıkarımı                │         │   ✓    │   │  │
│  │  UYAP dosya özeti             │   ✓     │        │   │  │
│  │  Aleyhe/Lehe tespiti          │         │   ✓    │   │  │
│  │  Dilekçe taslak               │   ✓     │        │   │  │
│  │  Dilekçe revizyon             │   ✓     │        │   │  │
│  │  İhtarname                   │   ✓     │        │   │  │
│  │  İçtihat araştırma           │         │   ✓    │   │  │
│  │  Genel Q&A                    │   ✓     │        │   │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚙️ AYARLAR                                          │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Confidence threshold: [%70 ▼]                        │  │
│  │  Max token limit: [10.000 ▼]                         │  │
│  │  Retry count: [3 ▼]                                  │  │
│  │  Timeout (sn): [30 ▼]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# BÖLÜM 3: MOBİL UYGULAMA (React Native)

## 3.1 Ekran Yapısı (Navigasyon)

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBİL NAVİGASYON                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    BOTTOM TAB BAR                    │   │
│  ├─────────┬─────────┬─────────┬─────────┬─────────────┤   │
│  │   🏠    │   📁    │   📋    │   💬    │     👤     │   │
│  │Dashboard│ Dosyalar│Tebligatlar│Tevkiller│  Profil   │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────             │
│                                                             │
│  HER EKRANDA:                                               │
│  - Üst bar: Logo, bildirim butonu, profil                    │
│  - Alt bar: 5 tab navigasyonu                               │
│                                                             │
│  ─────────────────────────────────────────────             │
│                                                             │
│  DETAY EKRANLARINA GİDİŞ:                                   │
│                                                             │
│  Dashboard → Dosya Detay                                   │
│       → Duruşma Detay                                      │
│       → Tebligat Detay                                     │
│       → Tevkil Detay                                       │
│                                                             │
│  Dosyalar → Dosya Detay                                    │
│           → Yeni Dosya Oluştur                             │
│           → Belge Yükleme                                  │
│                                                             │
│  Tebligatlar → Tebligat Detay                              │
│              → Dosyaya Ekle                                │
│                                                             │
│  Tevkiller → Tevkil Detay                                  │
│            → Yeni Tevkil Oluştur                          │
│            → Avukat Profili                                │
│                                                             │
│  Profil → Profili Düzenle                                  │
│         → Ayarlar                                          │
│         → UETS Giriş                                       │
│         → Çıkış                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Mobil Özgü Ekranlar

### 3.2.1 Dashboard (Ana Panel)

```
┌─────────────────────────────────────┐
│  Refik            [🔔] [👤]     │
├─────────────────────────────────────┤
│                                     │
│  Merhaba, Av. John!                 │
│  Bugün 3 duruşmanız var              │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📅 15:00 - İstanbul 5. AH  │    │
│  │     Alacak Davası          │    │
│  │     [Harita] [Tevkil Ver]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📅 10:00 - Ankara 2. AHM   │    │
│  │     Boşanma                │    │
│  │     [Harita] [Tevkil Ver]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  YAKLAŞAN SÜRELER                  │
│  ┌─────────────────────────────┐    │
│  │ ⚠️ İtiraz - 12 gün kaldı   │    │
│  │    Dosya: 2024/001         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  HIZLI İŞLEMLER                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │+   │ │📁  │ │📋  │ │🔍  │      │
│  │Dilek│ │Dosy│ │Tevk│ │UYTAP│     │
│  │çe  │ │Ekle│ │il  │ │Ara │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
├─────────────────────────────────────┤
│  🏠    📁    📋    💬    👤        │
└─────────────────────────────────────┘
```

### 3.2.2 Tevkil Detay (Mobil)

```
┌─────────────────────────────────────┐
│  ← Tevkil Detay                    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📤 GÖNDERİLEN TEVKİL       │    │
│  └─────────────────────────────┘    │
│                                     │
│  Dosya: 2024/001 - Alacak Davası   │
│  Mahkeme: İstanbul 5. Asliye Hukuk  │
│  Tarih: 15 Haziran 2026, 10:00      │
│                                     │
│  Durum: ⏳ Beklemede               │
│                                     │
│  Not: Müvekkil ısrar etti          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ÖNERİLEN AVUKATLAR                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ⭐ 4.8  Av. Selin Kaya      │    │
│  │ 📍 Kadıköy, İstanbul       │    │
│  │ ✅ Hemen yanıt verir        │    │
│  │ [Seç] [Profili İncele]    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ⭐ 4.6  Av. Emre Yıldız    │    │
│  │ 📍 Maltepe, İstanbul       │    │
│  │ [Seç] [Profili İncele]    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [İptal Et]  [Mesaj Gönder]        │
│                                     │
├─────────────────────────────────────┤
│  🏠    📁    📋    💬    👤        │
└─────────────────────────────────────┘
```

### 3.2.3 UETS Giriş (Mobil - Özel)

```
┌─────────────────────────────────────┐
│  ← UETS Bağlantısı                 │
├─────────────────────────────────────┤
│                                     │
│  📬 Tebligatlarınızı otomatik       │
│     takip etmek için UETS'e         │
│     bağlanın                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                               │    │
│  │   🏢 UETS                     │    │
│  │   PTT Posta ve Telgraf       │    │
│  │   Teşkilatı A.Ş.             │    │
│  │                               │    │
│  │   ┌───────────────────────┐   │    │
│  │   │  TC Kimlik / Vergi No │   │    │
│  │   └───────────────────────┘   │    │
│  │                               │    │
│  │   ┌───────────────────────┐   │    │
│  │   │  Şifre               │   │    │
│  │   └───────────────────────┘   │    │
│  │                               │    │
│  │   [ ] Oturumu açık tut       │    │
│  │                               │    │
│  │   ┌───────────────────────┐   │    │
│  │   │     BAĞLAN             │   │    │
│  │   └───────────────────────┘   │    │
│  │                               │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⚠️ UETS bilgileriniz yalnızca     │
│     doğrulama için kullanılır       │
│     veereke servislerde saklanmaz   │
│                                     │
│  🔒 SSL şifrelemeli bağlantı       │
│                                     │
├─────────────────────────────────────┤
│  🏠    📁    📋    💬    👤        │
└─────────────────────────────────────┘
```

---

# BÖLÜM 4: CHROME EKLENTİSİ (Manifest V3)

## 4.1 Popup Arayüzü

```
┌─────────────────────────────────────────────┐
│  Refik                        [⚙️] [X]  │
├─────────────────────────────────────────────┤
│                                             │
│  👤 Av. John Doe                           │
│  📧 john@lawfirm.com                        │
│  ───────────────────────────────────────    │
│                                             │
│  DURUM: ✅ UYAP Bağlı                      │
│  DURUM: ✅ UETS Bağlı                      │
│                                             │
│  ───────────────────────────────────────    │
│                                             │
│  📁 AKTİF DOSYALAR (12)                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 2024/001 - Alacak Davası            │   │
│  │ 🤖 AI: Aleyhinize 1 karar           │   │
│  │ [Dosyayı Aç] [Özetle]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 2024/002 - Boşanma                 │   │
│  │ 🤖 AI: Lehinize 2 karar            │   │
│  │ [Dosyayı Aç] [Özetle]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ───────────────────────────────────────    │
│                                             │
│  📋 SON İŞLEMLER                           │
│                                             │
│  • 2024/001 - Dosya özetlendi (2 dk önce)  │
│  • 2024/003 - Yeni tebligat eklendi        │
│                                             │
│  ───────────────────────────────────────    │
│                                             │
│  [📂 Tüm Dosyalar]                         │
│  [📊 İstatistikler]                        │
│                                             │
│  [🚀 UYAP'ta Aç]                           │
│                                             │
└─────────────────────────────────────────────┘
```

## 4.2 UYAP Sayfasında Side Panel

```
┌─────────────────────────────────────────────────────────────┐
│  UYAP SİTESİ                                               │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  ┌─────────────────────────────────────────────┐ ┌────────┐ │
│  │                                             │ │        │ │
│  │           UYAP İÇERİĞİ                      │ │ AVUKAT │ │
│  │                                             │ │  PRO   │ │
│  │  [Dosya ara...]                             │ │ SİDE   │ │
│  │                                             │ │ PANEL  │ │
│  │  Dosya: 2024/001                            │ │        │ │
│  │  Konu: Alacak Davası                        │ │ 🤖 AI  │ │
│  │                                             │ │ ÖZETİ: │ │
│  │  [Dosya detayları...]                       │ │        │ │
│  │                                             │ │ Bu dos │ │
│  │                                             │ │ yada 12 │ │
│  │                                             │ │ sayfa   │ │
│  │                                             │ │ içerik │ │
│  │                                             │ │ var.   │ │
│  │                                             │ │        │ │
│  │                                             │ │Aleyhin:│ │
│  │                                             │ │1 karar │ │
│  │                                             │ │Lehin:  │ │
│  │                                             │ │0 karar │ │
│  │                                             │ │        │ │
│  │                                             │ │[Detaylı│ │
│  │                                             │ │Özet]   │ │
│  │                                             │ │        │ │
│  │                                             │ │[Dosyaya│ │
│  │                                             │ │Ekle]   │ │
│  │                                             │ │        │ │
│  │                                             │ └────────┘ │
│  └─────────────────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# BÖLÜM 5: BACKEND MİMARİSİ

## 5.1 Genel Mimari

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND MİMARİSİ                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│   │    WEB      │    │   MOBİL    │    │  CHROME     │             │
│   │  (Next.js)  │    │   (RN)     │    │   EKLENTİ   │             │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘             │
│          │                  │                  │                    │
│          └──────────────────┼──────────────────┘                    │
│                             │                                       │
│                             ▼                                       │
│              ┌─────────────────────────────┐                       │
│              │        API GATEWAY           │                       │
│              │   (Kong / AWS API Gateway)   │                       │
│              └──────────────┬──────────────┘                       │
│                             │                                       │
│          ┌──────────────────┼──────────────────┐                    │
│          │                  │                  │                    │
│          ▼                  ▼                  ▼                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│   │  Auth Svc    │  │  Core API    │  │  AI Gateway  │            │
│   │  (Node/Nest) │  │  (Node/Nest) │  │  (Node/Nest) │            │
│   │  Port: 3001  │  │  Port: 3000  │  │  Port: 3002  │            │
│   └──────────────┘  └──────┬───────┘  └──────────────┘            │
│                             │                                       │
│   ┌────────────────────────┼────────────────────────┐             │
│   │                        │                        │             │
│   ▼                        ▼                        ▼             │
│ ┌──────┐            ┌──────────┐            ┌────────────┐         │
│ │Postgr│            │  Redis   │            │  Pinecone  │         │
│ │eSQL  │            │  Cache   │            │ (VektorDB) │         │
│ └──┬───┘            └──────────┘            └────────────┘         │
│    │                                                         │
│    │                         ┌─────────────┐                 │
│    │                         │ CloudFlare │                 │
│    │                         │     R2      │                 │
│    │                         │  (Dosyalar) │                 │
│    │                         └─────────────┘                 │
│    │                                                         │
│    │            ┌─────────────────────────────┐              │
│    └────────────┤      DIŞ SERVİSLER          ├────────────┘
│                 │                             │
│                 │  ┌─────────┐ ┌─────────┐   │
│                 │  │ NetGSM  │ │SendGrid │   │
│                 │  │  (SMS)  │ │(Email) │   │
│                 │  └─────────┘ └─────────┘   │
│                 │                             │
│                 └─────────────────────────────┘
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 5.2 Servis Mimarisi

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MİKRO SERVİS YAPISI                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      AUTH SERVICE                            │   │
│  │                      Port: 3001                              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  • /auth/register       - Kayıt                              │   │
│  │  • /auth/login          - Giriş                              │   │
│  │  • /auth/refresh        - Token yenile                       │   │
│  │  • /auth/logout         - Çıkış                              │   │
│  │  • /auth/forgot-password- Şifre unuttum                      │   │
│  │  • /auth/verify-otp    - OTP doğrulama                       │   │
│  │  • /auth/google         - Google OAuth                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      CORE API                                 │   │
│  │                      Port: 3000                              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │   Users     │  │   Cases      │  │   Files      │       │   │
│  │  │  Module     │  │  Module      │  │  Module      │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │Delegations  │  │Notifications│  │  Documents   │       │   │
│  │  │  Module     │  │  Module     │  │  Module      │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │ Reminders    │  │  Payments   │  │  Admin      │       │   │
│  │  │  Module      │  │  Module     │  │  Module     │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      AI GATEWAY                             │   │
│  │                      Port: 3002                              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  • /ai/summarize       - Tebligat/belge özetleme            │   │
│  │  • /ai/deadline-extract- Süre çıkarımı                       │   │
│  │  • /ai/case-summary    - Dosya özeti                         │   │
│  │  • /ai/document-generate- Dilekçe üretimi                    │   │
│  │  • /ai/legal-research  - İçtihat araştırması                │   │
│  │  • /ai/analyze-decision- Karar analizi (aleyhe/lehe)        │   │
│  │  • /ai/chat           - Genel Q&A                           │   │
│  │                                                              │   │
│  │  Routing: Minimax veya Claude seçimi                        │   │
│  │  Config: Admin panelden yapılandırılır                       │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# BÖLÜM 6: VERİTABANI ŞEMASI (PostgreSQL)

## 6.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VERİTABANI ŞEMASI (ERD)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐         ┌─────────────────┐                    │
│   │     users       │         │   subscriptions │                    │
│   ├─────────────────┤         ├─────────────────┤                    │
│   │ id (PK)         │         │ id (PK)         │                    │
│   │ email           │         │ user_id (FK)    │                    │
│   │ password_hash   │         │ package_type    │                    │
│   │ name            │─────────│ token_limit     │                    │
│   │ phone           │         │ tokens_used     │                    │
│   │ phone_verified  │         │ start_date      │                    │
│   │ avatar_url      │         │ end_date        │                    │
│   │ expertise       │         │ is_active       │                    │
│   │ city            │         │ created_at      │                    │
│   │ district        │         └─────────────────┘                    │
│   │ court           │                                                │
│   │ rating          │         ┌─────────────────┐                    │
│   │ rating_count    │         │    cases        │                    │
│   │ created_at      │         ├─────────────────┤                    │
│   │ updated_at      │         │ id (PK)         │                    │
│   └────────┬────────┘         │ user_id (FK)    │────────┐           │
│            │                 │ case_number     │        │           │
│            │                 │ court           │        │           │
│            │                 │ parties          │        │           │
│            │                 │ subject          │        │           │
│            │                 │ status           │        │           │
│            │                 │ created_at      │        │           │
│            │                 │ updated_at      │        │           │
│            │                 └────────┬────────┘        │           │
│            │                          │                 │           │
│            │                          │                 │           │
│   ┌────────┴────────┐         ┌────────┴────────┐        │           │
│   │  delegations    │         │  notifications │        │           │
│   ├─────────────────┤         ├─────────────────┤        │           │
│   │ id (PK)         │         │ id (PK)         │        │           │
│   │ from_user_id(FK)│         │ user_id (FK)   │        │           │
│   │ to_user_id (FK) │         │ case_id (FK)   │        │           │
│   │ case_id (FK)    │         │ type            │        │           │
│   │ hearing_date    │         │ content         │        │           │
│   │ status          │         │ deadline        │        │           │
│   │ message         │         │ sent_date       │        │           │
│   │ rating          │         │ read_date       │        │           │
│   │ created_at      │         │ is_read         │        │           │
│   │ updated_at      │         │ is_starred      │        │           │
│   └─────────────────┘         └─────────────────┘        │           │
│                                                       │           │
│   ┌─────────────────┐         ┌─────────────────┐      │           │
│   │   documents     │         │   hearings      │      │           │
│   ├─────────────────┤         ├─────────────────┤      │           │
│   │ id (PK)         │         │ id (PK)         │      │           │
│   │ user_id (FK)    │         │ case_id (FK)   │      │           │
│   │ case_id (FK)    │─────────│ hearing_date   │      │           │
│   │ type            │         │ court           │      │           │
│   │ title           │         │ status          │      │           │
│   │ content         │         │ notes           │      │           │
│   │ file_url        │         │ created_at      │      │           │
│   │ status          │         └─────────────────┘      │           │
│   │ ai_model_used   │                                     │           │
│   │ created_at      │         ┌─────────────────┐      │           │
│   │ updated_at      │         │   reminders     │      │           │
│   └─────────────────┘         ├─────────────────┤      │           │
│                               │ id (PK)         │      │           │
│   ┌─────────────────┐         │ user_id (FK)   │      │           │
│   │ ai_config       │         │ case_id (FK)   │      │           │
│   ├─────────────────┤         │ notification_id│      │           │
│   │ id (PK)         │         │ (FK)           │      │           │
│   │ task_name       │         │ type            │      │           │
│   │ model           │         │ due_date        │      │           │
│   │ is_active       │         │ remind_at       │      │           │
│   │ updated_at      │         │ status          │      │           │
│   │ updated_by (FK) │         │ created_at     │      │           │
│   └─────────────────┘         └─────────────────┘      │           │
│                                                           │           │
│   ┌─────────────────┐         ┌─────────────────┐        │           │
│   │   user_tokens   │         │   uets_sessions │        │           │
│   ├─────────────────┤         ├─────────────────┤        │           │
│   │ id (PK)         │         │ id (PK)         │        │           │
│   │ user_id (FK)    │         │ user_id (FK)   │        │           │
│   │ token_amount    │         │ encrypted_cred  │        │           │
│   │ used_amount     │         │ session_data    │        │           │
│   │ period_start    │         │ last_sync_at    │        │           │
│   │ period_end      │         │ is_active       │        │           │
│   └─────────────────┘         └─────────────────┘        │           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 6.2 Tablo Detayları

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,

    -- Mesleki bilgiler
    baro_reg VARCHAR(100),
    expertise TEXT[], -- Array: ['Aile Hukuku', 'Borçlar Hukuku']
    city VARCHAR(100),
    district VARCHAR(100),
    court VARCHAR(255),

    -- Puanlama
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,

    -- Abonelik
    subscription_status VARCHAR(50) DEFAULT 'free',

    -- Zaman
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Soft delete
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
```

### cases
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    case_number VARCHAR(100) NOT NULL,
    court VARCHAR(255),
    parties JSONB, -- {"plaintiff": "...", "defendant": "..."}
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active', -- active, closed, archived
    ai_summary TEXT,
    decision_analysis JSONB, -- {"against": 1, "in_favor": 0}

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT unique_case_number UNIQUE(user_id, case_number)
);

CREATE INDEX idx_cases_user ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_court ON cases(court);
```

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    case_id UUID REFERENCES cases(id),

    type VARCHAR(50) NOT NULL, -- 'decision', 'hearing', 'deadline', 'delegation'
    title VARCHAR(255) NOT NULL,
    content TEXT,

    -- Süre bilgisi
    deadline DATE,
    deadline_days INTEGER,

    -- Tebligat detay
    sent_date TIMESTAMP,
    read_date TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,

    -- UETS bilgisi
    uets_id VARCHAR(100),
    uets_read BOOLEAN DEFAULT FALSE,
    uets_opened_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_case ON notifications(case_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_deadline ON notifications(deadline);
```

### delegations
```sql
CREATE TABLE delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Gönderen ve alan
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),

    -- Dosya ve duruşma
    case_id UUID REFERENCES cases(id),
    hearing_date TIMESTAMP,
    court VARCHAR(255),

    -- Durum ve not
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled, completed
    message TEXT,
    admin_note TEXT,

    -- Puanlama
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    rating_comment TEXT,

    -- Zaman
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP, -- 24 saat sonra otomatik iptal
    deleted_at TIMESTAMP
);

CREATE INDEX idx_delegations_from ON delegations(from_user_id);
CREATE INDEX idx_delegations_to ON delegations(to_user_id);
CREATE INDEX idx_delegations_status ON delegations(status);
CREATE INDEX idx_delegations_expires ON delegations(expires_at);
```

### ai_config
```sql
CREATE TABLE ai_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL, -- 'minimax' veya 'claude'
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,

    -- Ayarlar
    settings JSONB, -- {"temperature": 0.7, "max_tokens": 1000}

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Varsayılan yapılandırma
INSERT INTO ai_config (task_name, model, is_active) VALUES
    ('notification_summary', 'minimax', TRUE),
    ('deadline_extract', 'claude', TRUE),
    ('case_summary', 'minimax', TRUE),
    ('decision_analysis', 'claude', TRUE),
    ('document_draft', 'minimax', TRUE),
    ('document_revise', 'minimax', TRUE),
    ('legal_notice', 'minimax', TRUE),
    ('legal_research', 'claude', TRUE),
    ('general_qa', 'minimax', TRUE);
```

---

# BÖLÜM 7: API ENDPOINTS (REST)

## 7.1 API Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BASE URL: /api/v1                                                  │
│  ─────────────────────────────────────                             │
│                                                                     │
│  AUTH SERVICE (Port 3001)                                           │
│  ─────────────────────────────────────                             │
│  POST   /auth/register           - Yeni kayıt                      │
│  POST   /auth/login              - Giriş                           │
│  POST   /auth/logout             - Çıkış                           │
│  POST   /auth/refresh            - Token yenile                     │
│  POST   /auth/forgot-password    - Şifre unuttum                    │
│  POST   /auth/reset-password     - Şifre sıfırla                    │
│  POST   /auth/verify-otp         - OTP doğrulama                    │
│  POST   /auth/google             - Google OAuth                     │
│  GET    /auth/me                 - Aktif kullanıcı bilgisi          │
│                                                                     │
│  USERS MODULE                                                       │
│  ─────────────────────────────────────                             │
│  GET    /users/profile             - Profil bilgileri               │
│  PUT    /users/profile             - Profil güncelle                 │
│  PUT    /users/password            - Şifre değiştir                  │
│  PUT    /users/avatar              - Avatar güncelle                 │
│  GET    /users/:id                 - Kullanıcı profil (herkes)        │
│  GET    /users/search              - Avukat ara                      │
│                                                                     │
│  CASES MODULE                                                       │
│  ─────────────────────────────────────                             │
│  GET    /cases                     - Dosya listesi                   │
│  POST   /cases                     - Yeni dosya oluştur             │
│  GET    /cases/:id                 - Dosya detay                    │
│  PUT    /cases/:id                 - Dosya güncelle                 │
│  DELETE /cases/:id                 - Dosya sil                      │
│  GET    /cases/:id/ai-summary      - AI özet                        │
│  GET    /cases/:id/hearings        - Duruşmalar                     │
│  POST   /cases/:id/hearings        - Duruşma ekle                   │
│  GET    /cases/:id/documents       - Belgeler                      │
│  GET    /cases/:id/notifications   - Tebligatlar                    │
│                                                                     │
│  NOTIFICATIONS MODULE                                               │
│  ─────────────────────────────────────                             │
│  GET    /notifications              - Tebligat listesi              │
│  GET    /notifications/:id          - Tebligat detay                │
│  PUT    /notifications/:id/read    - Okundu işaretle               │
│  PUT    /notifications/:id/star    - Yıldızla                      │
│  POST   /notifications/:id/reminder- Hatırlatıcı oluştur           │
│  GET    /notifications/unread-count- Okunmamış sayısı              │
│                                                                     │
│  DELEGATIONS MODULE                                                 │
│  ─────────────────────────────────────                             │
│  GET    /delegations                - Tevkil listesi (gönderilen+alınan)│
│  POST   /delegations                - Yeni tevkil oluştur           │
│  GET    /delegations/:id            - Tevkil detay                  │
│  PUT    /delegations/:id/approve   - Tevkili onayla                │
│  PUT    /delegations/:id/reject     - Tevkili reddet                │
│  PUT    /delegations/:id/cancel     - Tevkili iptal et               │
│  PUT    /delegations/:id/complete   - Tevkili tamamla               │
│  POST   /delegations/:id/rate       - Puanla                        │
│  GET    /delegations/recommended    - Önerilen avukatlar             │
│                                                                     │
│  DOCUMENTS MODULE                                                   │
│  ─────────────────────────────────────                             │
│  GET    /documents                  - Belge listesi                 │
│  POST   /documents                  - Yeni belge oluştur            │
│  GET    /documents/:id              - Belge detay                    │
│  PUT    /documents/:id              - Belge güncelle                 │
│  DELETE /documents/:id              - Belge sil                      │
│  GET    /documents/:id/download     - İndir (PDF/Word)              │
│  POST   /documents/:id/revise       - Revize iste                    │
│                                                                     │
│  AI GATEWAY (Port 3002)                                             │
│  ─────────────────────────────────────                             │
│  POST   /ai/summarize               - Özetle                       │
│  POST   /ai/deadline-extract        - Süre çıkar                    │
│  POST   /ai/case-summary            - Dosya özeti                   │
│  POST   /ai/document-generate      - Dilekçe üret                   │
│  POST   /ai/document-revise        - Dilekçe revize                 │
│  POST   /ai/legal-research         - İçtihat ara                    │
│  POST   /ai/analyze-decision       - Karar analiz et               │
│  POST   /ai/chat                   - Genel Q&A                      │
│  GET    /ai/config                  - AI yapılandırma (admin)       │
│  PUT    /ai/config                  - AI yapılandırma güncelle       │
│                                                                     │
│  ADMIN MODULE                                                       │
│  ─────────────────────────────────────                             │
│  GET    /admin/users                - Tüm kullanıcılar              │
│  PUT    /admin/users/:id            - Kullanıcı güncelle             │
│  DELETE /admin/users/:id            - Kullanıcı sil                  │
│  GET    /admin/stats               - İstatistikler                  │
│  GET    /admin/ai-config           - AI yapılandırma               │
│  PUT    /admin/ai-config/:task     - AI görev güncelle              │
│  POST   /admin/broadcast            - Toplu bildirim gönder          │
│                                                                     │
│  UETS MODULE                                                        │
│  ─────────────────────────────────────                             │
│  POST   /uets/connect              - UETS bağlantısı kur           │
│  DELETE /uets/disconnect           - UETS bağlantısını kes          │
│  GET    /uets/status               - Bağlantı durumu                │
│  GET    /uets/notifications        - UETS tebligatları getir        │
│  POST   /uets/sync                 - Manuel senkronizasyon          │
│                                                                     │
│  FILES MODULE                                                       │
│  ─────────────────────────────────────                             │
│  POST   /files/upload              - Dosya yükle                   │
│  GET    /files/:id                 - Dosya indir                   │
│  DELETE /files/:id                 - Dosya sil                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 7.2 API Request/Response Örnekleri

### POST /api/v1/auth/register
```json
// Request
{
  "name": "Av. John Doe",
  "email": "john@lawfirm.com",
  "phone": "+905321234567",
  "password": "SecurePass123!",
  "kvkk_consent": true
}

// Response (201)
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-xxx",
      "name": "Av. John Doe",
      "email": "john@lawfirm.com"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "expires_in": 3600
    }
  }
}
```

### GET /api/v1/cases
```json
// Request (query params: ?status=active&page=1&limit=20)
// Response (200)
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "uuid-xxx",
        "case_number": "2024/001",
        "court": "İstanbul 5. Asliye Hukuk",
        "subject": "Alacak Davası",
        "status": "active",
        "next_hearing": "2026-06-15T10:00:00Z",
        "unread_notifications": 3,
        "created_at": "2024-03-12T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 23,
      "pages": 2
    }
  }
}
```

### POST /api/v1/delegations
```json
// Request
{
  "case_id": "uuid-xxx",
  "expertise": ["Borçlar Hukuku"],
  "hearing_date": "2026-06-15T10:00:00Z",
  "court": "İstanbul 5. Asliye Hukuk",
  "message": "Müvekkil çok ısrar etti, lütfen dikkatli olunuz.",
  "preferred_lawyer_id": "uuid-yyy" // opsiyonel
}

// Response (201)
{
  "success": true,
  "data": {
    "delegation": {
      "id": "uuid-zzz",
      "status": "pending",
      "expires_at": "2026-06-02T10:00:00Z",
      "recommended_lawyers": [
        {
          "id": "uuid-yyy",
          "name": "Av. Selin Kaya",
          "rating": 4.8,
          "rating_count": 127,
          "city": "İstanbul",
          "district": "Kadıköy",
          "expertise": ["Borçlar Hukuku", "Aile Hukuku"]
        }
      ]
    }
  }
}
```

### POST /api/v1/ai/summarize
```json
// Request
{
  "text": "T.C. İSTANBUL 5. ASLİYE HUKUK MAHKEMESİ\n\nDAVACI: Ahmet Yılmaz (TC: 12345678901)\n\nDAVALI: Mehmet Demir (TC: 98765432109)\n\nDAVA: Alacak Davası\n\nDAVA DEĞERİ: 150.000 TL\n\nDAVA TARİHİ: 12.03.2024\n\nTARAFLARIN İDDİALARI:\nDavacı vekili, müvekkilinin davalıdan 150.000 TL alacağını ileri sürerek işbu davayı açmıştır...\n\nKARAR: Mahkememizce yapılan yargılama sonunda; davanın kısmen kabulü ile 120.000 TL alacağın davalıdan tahsili ile davacıya verilmesine, bakiye 30.000 TL alacağın reddine karar verilmiştir.",
  "type": "decision"
}

// Response (200)
{
  "success": true,
  "data": {
    "summary": "Mahkeme davayı kısmen kabul etti. Davacı Ahmet Yılmaz, davalı Mehmet Demir'den 120.000 TL alacak alacak. 30.000 TL'lık kısım reddedildi.",
    "type": "decision",
    "key_points": [
      "Davacı 150.000 TL talep etmiş, mahkeme 120.000 TL'sini kabul etmiş",
      "120.000 TL + %15 faiz ile tahsili gerekiyor",
      "Karar kesinleşmedi, itiraz süresi 14 gün"
    ],
    "deadline": {
      "type": "itiraz",
      "days": 14,
      "date": "2026-06-15"
    },
    "confidence": 0.92,
    "model_used": "minimax"
  }
}
```

### POST /api/v1/ai/document-generate
```json
// Request
{
  "type": "petition",
  "case_id": "uuid-xxx",
  "details": {
    "type": "boşanma",
    "plaintiff": "Ayşe Kaya",
    "defendant": "Ali Öztürk",
    "requests": [
      "Velayet: Ortak çocuk için anne olarak velayet talep edilmektedir",
      "Nafaka: Aylık 10.000 TL tedbir nafakası talep edilmektedir",
      "Mal paylaşımı: Kadıköy'deki 3+1 daire için ortaklık paylaşımı talep edilmektedir",
      "Kişisel eşyalar: Her tarafın şahsi eşyaları kendisine verilsin"
    ],
    "style": "resmi"
  }
}

// Response (200)
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid-doc",
      "type": "petition",
      "title": "Boşanma Dilekçesi",
      "content": "T.C. İSTANBUL AİLE MAHKEMESİ\n\nDAVACI: Ayşe Kaya (TC: ...)\nvs.\nDAVALI: Ali Öztürk (TC: ...)\n\nDAVA: Boşanma (TMK m. 166)\n...",
      "word_count": 850,
      "estimated_time": "15 dakika"
    },
    "ai_model_used": "minimax",
    "confidence": 0.88
  }
}
```

---

# BÖLÜM 8: SWAGGER & API DOKÜMANTASYON

## 8.1 Swagger Yapısı

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SWAGGER / OpenAPI                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  API Documentation: https://api.refik.app/docs                  │
│  Swagger UI: https://api.refik.app/swagger                       │
│  Redoc: https://api.refik.app/redoc                               │
│                                                                     │
│  ─────────────────────────────────────                             │
│                                                                     │
│  OpenAPI Specification (openapi.yaml)                               │
│  ─────────────────────────────────────                             │
│                                                                     │
│  /api/v1/openapi.yaml                                              │
│  │                                                                 │
│  ├─ info:                                                           │
│  │    title: Refik API                                          │
│  │    version: 1.0.0                                                │
│  │    description: Türkiye'nin hukuk asistanı API                  │
│  │    contact: support@refik.app                                │
│  │    license: MIT                                                  │
│  │                                                                 │
│  ├─ servers:                                                        │
│  │    - url: https://api.refik.app/api/v1                       │
│  │      description: Production                                     │
│  │    - url: https://staging-api.refik.app/api/v1               │
│  │      description: Staging                                        │
│  │    - url: http://localhost:3000/api/v1                            │
│  │      description: Local Development                              │
│  │                                                                 │
│  ├─ components:                                                     │
│  │    securitySchemes:                                              │
│  │      bearerAuth:                                                 │
│  │        type: http                                                │
│  │        scheme: bearer                                            │
│  │        bearerFormat: JWT                                         │
│  │    schemas: (Tüm modeller)                                       │
│  │    responses:                                                    │
│  │    parameters:                                                  │
│  │                                                                 │
│  └─ paths: (Tüm endpointlar)                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 8.2 Swagger Tag Yapısı

```yaml
tags:
  - name: Auth
    description: Kimlik doğrulama işlemleri
  - name: Users
    description: Kullanıcı ve profil işlemleri
  - name: Cases
    description: Dosya/dava işlemleri
  - name: Notifications
    description: Tebligat işlemleri
  - name: Delegations
    description: Tevkil işlemleri
  - name: Documents
    description: Belge/dilekçe işlemleri
  - name: AI
    description: Yapay zeka işlemleri
  - name: Admin
    description: Yönetici işlemleri (Admin only)
  - name: UETS
    description: UETS entegrasyonu
  - name: Files
    description: Dosya yükleme/indirme
```

---

# BÖLÜM 9: GERÇEKLEŞTİRME SIRASI

## 9.1 Faz 0 - Temel Altyapı (Ay 1-2)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FAZ 0: TEMEL ALTYAPI                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Sprint 1-2 (Hafta 1-4)                                            │
│  ─────────────────────────────────────                             │
│  □ Proje yapısını kur (Next.js, NestJS, React Native)              │
│  □ Git repository ve CI/CD başlat                                  │
│  □ PostgreSQL veritabanı kur ve şema oluştur                       │
│  □ Redis kur ve bağlantı test et                                   │
│  □ API Gateway yapılandır                                          │
│  □ Swagger dokümantasyonu başlat                                   │
│                                                                     │
│  Sprint 3-4 (Hafta 5-8)                                            │
│  ─────────────────────────────────────                             │
│  □ Auth service tamamla (register, login, JWT)                     │
│  □ Users module tamamla                                           │
│  □ Admin panel temel ekranları                                     │
│  □ Web: Login, Register, Dashboard ekranları                       │
│  □ AI config admin paneli                                         │
│  □ Push notification altyapısı                                    │
│                                                                     │
│  Çıkış Kriteri: Login + OTP çalışıyor, Admin panel aktif          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 9.2 Faz 1 - Tevkil + Tebligat (Ay 3-4)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FAZ 1: TEVKİL + TEBLİGAT                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Sprint 5-6 (Hafta 9-12)                                           │
│  ─────────────────────────────────────                             │
│  □ Cases module tamamla                                            │
│  □ Notifications module tamamla                                     │
│  □ Delegations module tamamla                                      │
│  □ UETS entegrasyonu başlat (WebView)                             │
│  □ Web: Dosyalar, Tebligatlar, Tevkiller ekranları                │
│  □ AI Gateway: notification_summary, deadline_extract              │
│                                                                     │
│  Sprint 7-8 (Hafta 13-16)                                          │
│  ─────────────────────────────────────                             │
│  □ UETS tam entegrasyon (okundu + 5 gün kuralı)                    │
│  □ Reminders module tamamla                                       │
│  □ Mobil: Dashboard, Dosyalar, Tebligatlar ekranları              │
│  □ SMS bildirim sistemi (NetGSM)                                  │
│  □ AI: case_summary, decision_analysis                             │
│                                                                     │
│  Çıkış Kriteri: 10 gerçek tevkil, 50 tebligat analiz edildi      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 9.3 Faz 2 - UYAP + RAG (Ay 5-6)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FAZ 2: UYAP + RAG                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Sprint 9-10 (Hafta 17-20)                                         │
│  ─────────────────────────────────────                             │
│  □ Chrome eklentisi temel (popup, content script)                 │
│  □ RAG altyapısı kur (Pinecone, embedding pipeline)                │
│  □ CloudFlare R2 entegrasyonu                                     │
│  □ AI: document_generate, legal_research                           │
│                                                                     │
│  Sprint 11-12 (Hafta 21-24)                                         │
│  ─────────────────────────────────────                             │
│  □ Chrome eklenti full otomasyon                                   │
│  □ Mobil: Tevkiller, Profil ekranları                            │
│  □ Web: Belgeler, Dilekçe üretici ekranları                       │
│  □ AI: document_revise, general_qa                                 │
│  □ RAG arama optimizasyonu                                        │
│                                                                     │
│  Çıkış Kriteri: 10 avukat eklenti kullanıyor, RAG doğru çalışıyor│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# BÖLÜM 10: TEKNOLOJİ STACK ÖZETİ

## 10.1 Frontend

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Web Framework** | Next.js 14 | React, SSR, PWA |
| **Web UI** | Tailwind CSS + shadcn/ui | Bileşen kütüphanesi |
| **Mobil** | React Native 0.73 | iOS + Android |
| **Mobil Navigation** | React Navigation 6 | Bottom tabs, stack |
| **State** | Zustand | Basit state yönetimi |
| **Forms** | React Hook Form + Zod | Validasyon |
| **HTTP Client** | Axios + React Query | API çağrıları |
| **Eklenti** | Chrome Ext. Manifest V3 | UYAP otomasyonu |

## 10.2 Backend

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Framework** | NestJS 10 | Node.js, TypeScript |
| **API Style** | REST + OpenAPI 3.0 | Swagger dokümantasyonu |
| **ORM** | Prisma | PostgreSQL ile çalışma |
| **Auth** | Passport.js + JWT | Kimlik doğrulama |
| **Validation** | class-validator | DTO validasyon |
| **Cache** | Redis + ioredis | Session, token cache |
| **Queue** | Bull + Redis | Background jobs |
| **AI SDK** | LangChain | AI motorları ile iletişim |

## 10.3 AI & Data

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **AI Motor 1** | Minimax M2.7 API | Varsayılan AI |
| **AI Motor 2** | Claude API | Admin seçimli |
| **Embeddings** | Minimax Embed | Vektör üretimi |
| **Vector DB** | Pinecone | RAG araması |
| **File Storage** | CloudFlare R2 | Belgeler |
| **Analytics** | PostHog | Kullanım takibi |

## 10.4 Altyapı

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Hosting** | AWS / Cloudflare | Web, API |
| **CDN** | Cloudflare | Statik dosyalar |
| **Database** | PostgreSQL 15 | Ana veritabanı |
| **CI/CD** | GitHub Actions | Build, test, deploy |
| **Container** | Docker | Servisler |
| **SMS** | NetGSM | Bildirimler |
| **Email** | SendGrid | Bildirimler |

---

*Plan tamamlandı.*
*Son güncelleme: 01 Haziran 2026*
*Versiyon: 1.0*
