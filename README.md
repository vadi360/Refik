# AvukatPro

<div align="center">

![AvukatPro Banner](https://avukatpro.com/banner.png)

**Versiyon:** 1.0 | **Tarih:** 02 Haziran 2026  
**GitHub:** https://github.com/vadi360/AvukatPro  
**Website:** https://avukatpro.com

*Mobil öncelikli, AI destekli hukuk asistanı ve tevkil pazar yeri*

---

| Proje | Durum | Teknoloji | Klasör |
|-------|-------|-----------|--------|
| **Backend API** | ✅ TAMAMLANDI | NestJS + TypeScript | `backend/` |
| **Web Uygulaması** | 📋 PLANLANIYOR | Next.js + PWA | `web/` |
| **Mobil Uygulama** | 📋 PLANLANIYOR | React Native | `mobile/` |
| **Admin Panel** | 📋 PLANLANIYOR | Next.js | `admin/` |
| **Chrome Eklentisi** | 📋 PLANLANIYOR | Manifest V3 | `chrome-extension/` |

</div>

---

## 📋 İçindekiler

1. [Hakkında](#1-hakkında)
2. [Vizyon & Misyon](#2-vizyon--misyon)
3. [Problem Çözüm](#3-problem--çözüm)
4. [Özellikler](#4-özellikler)
5. [Hedef Kitle & Persona](#5-hedef-kitle--persona)
6. [İş Modeli & Fiyatlandırma](#6-iş-modeli--fiyatlandırma)
7. [Rekabet Analizi](#7-rekabet-analizi)
8. [Teknoloji Stack](#8-teknoloji-stack)
9. [Mimari](#9-mimari)
10. [Proje Yapısı](#10-proje-yapısı)
11. [Başlangıç & Kurulum](#11-başlangıç--kurulum)
12. [Dokümantasyon](#12-dokümantasyon)
13. [Roadmap](#13-roadmap)
14. [Katkı](#14-katkı)
15. [Lisans & İletişim](#15-lisans--iletişim)

---

## 1. Hakkında

**AvukatPro**, Türkiye'deki avukatlara yönelik, mobil öncelikli yapay zekâ destekli bir hukuk asistanı ve tevkil pazar yeridir. Avukatların günlük işlerini otomatikleştirir, tebligat takibini kolaylaştırır ve duruşma/işlem takibi için güvenilir avukat eşleştirmesi sağlar.

### Temel Değer Önerisi

| Pain Point | AvukatPro Çözümü |
|------------|------------------|
| Tebligat süresi kaçırma | AI analizli UETS entegrasyonu + otomatik hatırlatıcı |
| UYAP'ta saatlerce arama | Chrome eklentisi ile tek tıkla dosya özeti |
| Tevkil için güvenilir avukat bulma | Puanlama + konum + uzmanlık bazlı eşleştirme |
| Dilekçe yazarken emsal bulamama | RAG destekli içtihat araştırması |
| İcra takibinde zorluk | Toplu takip + AI mal varlığı tespiti |

---

## 2. Vizyon & Misyon

### 🎯 Vizyon

> *"Türkiye'deki her avukatın cebinde güvenilir bir hukuk asistanı olması."*

### 🎯 Misyon

> *"Hukuk profesyonellerinin verimliliğini artırmak, hataları azaltmak ve adalete erişimi hızlandırmak için人工智能 teknolojisini kullanmak."*

### Değerlerimiz

| Değer | Açıklama |
|-------|----------|
| **Güvenilirlik** | Hukuki süreçlerde hata kabul edilemez. %100 doğruluk hedefliyoruz. |
| **Şeffaflık** | Fiyatlandırma, AI kararları ve işlemlerde şeffaflık. |
| **Gizlilik** | KVKK uyumlu, Türkiye'de veri depolama. |
| **Erişilebilirlik** | Her avukata uygun fiyatlı çözümler sunmak. |
| **Sürekli İyileştirme** | AI modelimizi sürekli geliştiriyoruz. |

---

## 3. Problem & Çözüm

### 📋 Türkiye Hukuk Pazarı

| Metrik | Değer | Kaynak |
|--------|-------|--------|
| Aktif Avukat | ~50,000 | TBB, 2025 |
| Yıllık Dava Sayısı | ~8 milyon | Adalet Bakanlığı |
| UYAP Kayıtlı Avukat | ~45,000 | UYAP, 2025 |
| Mobil Kullanım | %78 | Türkiye İstatistik Kurumu |

### ❌ Mevcut Sorunlar

1. **Tebligat Takibi**
   - Manuel takip = süre kaçırma riski
   - UETS'e sürekli giriş gerekiyor
   - Okunmayan tebligat = yasal sonuç

2. **UYAP Dosya Arama**
   - Her davanın detayı için saatler harcanıyor
   - Arama sonuçları karmaşık
   - Özet çıkarma manuel

3. **Tevkil Bulma**
   - Güvenilir avukat bulmak zor
   - Koordinasyon eksikliği
   - Komisyon maliyeti

4. **Belge Üretimi**
   - Dilekçe yazımı zaman alıyor
   - Emsal/içtihat araştırması zor
   - Format tutarsızlıkları

### ✅ AvukatPro Çözümleri

| Sorun | AvukatPro Çözüm | Sonuç |
|-------|-----------------|-------|
| Tebligat kaçırma | UETS 5 gün kuralı otomasyonu + AI analiz | %90 süre kaçırma azaltma |
| UYAP arama | Chrome eklentisi + RAG özetleme | %70 zaman tasarrufu |
| Tevkil bulma | Puanlama + konum + uzmanlık eşleştirme | 24 saat içinde eşleşme |
| Belge üretimi | AI ile dilekçe/ihtarname üretimi | %50 hız artışı |

---

## 4. Özellikler

### 4.1 Tevkil Pazar Yeri

**Açıklama:** Avukatlar arası duruşma ve işlem takibi için otomatik eşleştirme sistemi.

| Özellik | Detay |
|---------|-------|
| Otomatik Eşleştirme | Konum, uzmanlık, mahkeme tipi bazlı |
| Puanlama Sistemi | 5 yıldız üzerinden avukat değerlendirme |
| Yük Dengeleme | Maksimum 5 aktif tevkil kuralı |
| Şikayet Yönetimi | Tevkil şikayetleri için admin panel |
| Ücretsiz | TBB kurallarına uygun (komisyon yok) |

**Kullanım Senaryosu:**
```
1. Avukat duruşma tarihini gördü → gidemeyecek
2. "Tevkil Ver" butonuna tıklar
3. Sistem aynı adliyede uygun avukatları listeler
4. Konum, uzmanlık, puan filtrelenir
5. Tevkil talebi gönderilir
6. Diğer avukat onaylar → her iki taraf bildirim alır
```

### 4.2 UETS Entegrasyonu

**Açıklama:** PTT UETS'ten tebligat çekme ve AI ile otomatik analiz.

| Özellik | Detay |
|---------|-------|
| Otomatik Çekme | Belirlenen aralıklarla tebligat senkronizasyonu |
| 5 Gün Kuralı | Açılmamış tebligatlar 5. günde otomatik işlenir |
| AI Özetleme | notification_summary görevi (sınırsız token) |
| Süre Çıkarımı | deadline_extract görevi (sınırsız token) |
| Hatırlatıcı | Otomatik hatırlatıcı oluşturma |

**AI Görev Dağılımı:**
| Görev | Model | Token Limit |
|-------|-------|-------------|
| notification_summary | MINIMAX | ❌ Sınırsız |
| deadline_extract | CLAUDE | ❌ Sınırsız |

### 4.3 UYAP Dosya Özetleme (Chrome Eklentisi)

**Açıklama:** Chrome eklentisi ile UYAP'tan dosya çekme ve RAG tabanlı özetleme.

| Özellik | Detay |
|---------|-------|
| Tek Tıkla Özet | UYAP'ta dosyayı seç → otomatik özet |
| RAG Destekli | Pinecone vektör DB ile相似度 arama |
| Anti-Halüsinasyon | Kaynak gösterimi + "emin değilim" eşiği |
| Duruşma Özeti | Son 10 duruşma, kararlar, taraflar |

### 4.4 Otomatik Belge Üretimi

**Açıklama:** AI ile dilekçe, ihtarname ve içtihat araştırması.

| Belge Türü | AI Görev | Token Limit |
|------------|----------|-------------|
| Dilekçe | document_generate | ✅ Var |
| Dilekçe Revizyon | document_revise | ✅ Var |
| İhtarname | legal_notice | ✅ Var |
| İçtihat Araştırması | legal_research | ✅ Var |

**Not:** Belge üretimi insan onayı gerektirir (requiresApproval).

### 4.5 İcra Takibi

**Açıklama:** Toplu icra takibi ve AI destekli mal varlığı tespiti.

| Özellik | Detay |
|---------|-------|
| Toplu Takip | XML dosyasından toplu icra aktarımı |
| Durum Takibi | Ödeme, satış, durdurma gibi durumlar |
| AI Mal Varlığı | Borçlunun mal varlığı tespiti |
| Call Center | Borçlu arama kayıtları ve ödeme sözleri |

### 4.6 Birleşik Takvim

**Açıklama:** Tüm zaman bazlı verilerin tek takvimde gösterimi.

| Veri Kaynağı | Takvim Item |
|--------------|-------------|
| Hearings | Duruşma tarihleri |
| Reminders | Hatırlatıcılar |
| Notifications | Süreli tebligatlar |
| IcraFiles | Satış tarihleri |
| CallCenter Promises | Ödeme sözleri |

### 4.7 Çoklu Kanal Bildirim

**Açıklama:** Push, SMS, Email, WhatsApp, Telegram ile bildirim.

| Kanal | Servis | Kullanım |
|-------|--------|----------|
| Push | Firebase FCM | Anlık bildirimler |
| SMS | NetGSM | Kritik hatırlatıcılar |
| Email | SendGrid | Özet bildirimler |
| WhatsApp | WhatsApp Business | Müşteri bildirimleri |
| Telegram | Telegram Bot API | Bot bildirimleri |

---

## 5. Hedef Kitle & Persona

### 5.1 Birincil Hedef Kitle

**Solo Avukatlar (4 kişiye kadar büro)**

| Persona | Detay |
|---------|-------|
| Yaş | 30-55 |
| Deneyim | 5-25 yıl |
| Ofis | Kendi ofisi veya küçük büro |
| Dava Türü | Aile, ceza, icra, ticari |
| Teknoloji | Orta düzey |

### 5.2 İkincil Hedef Kitle

**Orta Ölçekli Hukuk Büroları**

| Persona | Detay |
|---------|-------|
| Ekip | 5-20 avukat |
| Yönetim | Büro yöneticisi |
| İhtiyaçlar | Ekip koordinasyonu, dosya paylaşımı |
| B2B Paket | Enterprise |

### 5.3 Persona Detayları

#### Persona A — "Köşe Avukatı" (Solo)
- **Profil:** 5 yıllık deneyim, kendi ofisi, aile hukuku odağlı
- **Öncelikler:** Tebligat takibi, duruşma hatırlatıcı, tevkil
- **Pain:** Günde 2-3 duruşma, tek asistan meşgul

#### Persona B — "Büro Sahibi" (Kurumsal)
- **Profil:** 10 yıllık deneyim, 5 kişilik ekip, ceza/icra
- **Öncelikler:** UYAP özetleme, ekip koordinasyonu, içtihat
- **Pain:** Ekip yönetimi, dosya takibi

#### Persona C — "Genç Avukat" (Yeni)
- **Profil:** 1-2 yıllık deneyim, stajyerlikten yeni
- **Öncelikler:** Dilekçe üretimi, emsal karar, öğrenme
- **Pain:** Her dava türüne bakıyor, deneyim eksik

---

## 6. İş Modeli & Fiyatlandırma

### 6.1 Gelir Kaynakları

| Kaynak | Açıklama |
|--------|----------|
| Abonelik | Aylık paket bazlı gelir |
| Token Paketleri | AI token satışı |
| B2B Sözleşmeleri | Kurumsal anlaşmalar |

### 6.2 Fiyatlandırma Tablosu

| Paket | Aylık | Yıllık | Token Limit | Özellikler |
|-------|-------|--------|-------------|------------|
| **Basic** | 199₺ | 1.990₺ | 1.000 | Temel özellikler, email destek |
| **Standard** | 499₺ | 4.990₺ | 3.000 | + UETS, + RAG, öncelikli destek |
| **Professional** | 999₺ | 9.990₺ | 10.000 | + Tevkil, + İcra, 7/24 destek |
| **Enterprise** | 1.999₺ | 19.990₺ | 50.000 | + B2B, + API, özel eğitim |

### 6.3 Token Paketleri

| Paket | Token | Fiyat |
|-------|-------|-------|
| Small | 5.000 | 99₺ |
| Medium | 15.000 | 249₺ |
| Large | 50.000 | 699₺ |

### 6.4 Hedefler

| Dönem | Hedef | Kullanıcı |
|-------|-------|----------|
| 6 ay | 10.000 avukat | Organik + pazarlama |
| 1 yıl | 25.000 avukat | Referans + B2B |
| 2 yıl | Türkiye geneli | Pazar liderliği |

---

## 7. Rekabet Analizi

### 7.1 Rakip Analizi

| Rakip | Güçlü Yönler | Zayıf Yönler |
|-------|--------------|--------------|
| **Forvis** | Kurumsal, geniş özellik | Web ağırlıklı, pahalı |
| **Legal One** | Entegre çözüm | Karmaşık, mobil zayıf |
| **İdea Teknoloji** | Yerel, yaygın | UI eski, AI yok |
| **Apilex** | Uzmanlaşmış | Sadece belirli dava türleri |

### 7.2 AvukatPro Farkı

| Fark | AvukatPro | Rakipler |
|------|-----------|----------|
| **Mobil** | ✅ Mobil öncelikli | ❌ Web ağırlıklı |
| **AI** | ✅ Hibrit (Minimax + Claude) | ❌ Sınırlı veya yok |
| **Fiyat** | ✅ Uygun (199₺'den) | ❌ Pahalı |
| **Tevkil** | ✅ Ücretsiz pazar | ❌ Komisyonlu |
| **UETS** | ✅ 5 gün kuralı otomasyonu | ❌ Manuel |

---

## 8. Teknoloji Stack

### 8.1 Backend

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | NestJS 10 | Backend framework |
| Language | TypeScript 5.3 | Tip güvenli programlama |
| Database | PostgreSQL 14+ | Ana veritabanı |
| ORM | Prisma 5 | Veritabanı erişimi |
| Cache | Redis | Session ve cache |
| Auth | JWT + OTP | Kimlik doğrulama |

### 8.2 AI & Veri

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| AI 1 | Minimax M2.7 | Türkiye KVKK uyumlu |
| AI 2 | Claude Sonnet | Yüksek doğruluk |
| Vektör DB | Pinecone | RAG sistemi |
| Storage | CloudFlare R2 | Dosya depolama |

### 8.3 Bildirim

| Kanal | Servis |
|-------|--------|
| Push | Firebase FCM |
| SMS | NetGSM |
| Email | SendGrid |
| WhatsApp | WhatsApp Business |
| Telegram | Telegram Bot API |

### 8.4 Frontend

| Uygulama | Teknoloji |
|----------|-----------|
| Web | Next.js 14 + React + PWA |
| Mobil | React Native |
| Admin | Next.js |
| Eklenti | Chrome Manifest V3 |

---

## 9. Mimari

### 9.1 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AVRUKATPRO SİSTEMİ                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│   │   WEB APP   │       │  MOBİL APP  │       │   CHROME    │              │
│   │  Next.js    │       │React Native │       │   EKLENTİSİ │              │
│   └──────┬──────┘       └──────┬──────┘       └──────┬──────┘              │
│          │                    │                    │                       │
│          └────────────────────┼────────────────────┘                    │
│                               │                                          │
│                               ▼                                          │
│                    ┌─────────────────────┐                            │
│                    │     API GATEWAY        │                            │
│                    │  (NestJS) Port: 3000   │                            │
│                    └──────────┬────────────┘                            │
│                               │                                        │
│      ┌────────────────────────┼────────────────────────┐               │
│      │                        │                        │               │
│      ▼                        ▼                        ▼               │
│ ┌──────────────┐      ┌──────────────┐        ┌──────────────┐          │
│ │  PostgreSQL  │      │    Redis    │        │   Pinecone   │          │
│ │  (Veritabanı)│      │   (Cache)   │        │  (Vektör DB) │          │
│ └──────────────┘      └──────────────┘        └──────────────┘          │
│                                                                             │
│                    ┌────────────────────────────────┐                  │
│                    │         DIŞ SERVİSLER            │                  │
│                    │  AI (Minimax/Claude), R2, FCM   │                  │
│                    └────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 AI Mimari Detayı

```
┌─────────────────────────────────────────────────────────────┐
│                    HİBRİT AI SİSTEMİ                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Client Request → JwtAuthGuard → AiService                 │
│                              │                              │
│                    ┌──────────┴──────────┐                  │
│                    │    ai_config DB     │                  │
│                    │  (Admin yapılandırma)│                  │
│                    └──────────┬──────────┘                  │
│                              │                              │
│              ┌───────────────┴───────────────┐              │
│              ▼                               ▼              │
│        ┌──────────┐                   ┌──────────┐          │
│        │ MINIMAX  │                   │  CLAUDE  │          │
│        │ M2.7     │                   │  Sonnet  │          │
│        │(Türkiye) │                   │          │          │
│        └──────────┘                   └──────────┘          │
│                                                             │
│  UETS Görevleri (sınırsız):                                │
│  - notification_summary (MINIMAX)                          │
│  - deadline_extract (CLAUDE)                              │
│                                                             │
│  Diğer Görevler (token limitli):                           │
│  - case_summary, document_generate, legal_research, vb.    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Proje Yapısı

### 10.1 Ana Klasör Yapısı

```
AvukatPro/
│
├── backend/                    # ✅ TAMAMLANDI - NestJS API
│   ├── src/
│   │   ├── modules/           # 21 modül
│   │   │   ├── auth/          # JWT + OTP
│   │   │   ├── users/        # Kullanıcı
│   │   │   ├── cases/        # Dava
│   │   │   ├── notifications/# Tebligat
│   │   │   ├── delegations/  # Tevkil
│   │   │   ├── documents/    # Belge
│   │   │   ├── reminders/    # Hatırlatıcı
│   │   │   ├── ai/           # AI
│   │   │   ├── admin/        # Admin
│   │   │   ├── uets/         # UETS
│   │   │   ├── uyap/         # UYAP
│   │   │   ├── cron/         # Jobs
│   │   │   ├── rag/          # RAG
│   │   │   ├── files/        # R2
│   │   │   ├── payments/     # Ödeme
│   │   │   ├── user-documents/# Özlük
│   │   │   ├── icra/         # İcra
│   │   │   ├── call-center/  # Arama
│   │   │   ├── calendar/     # Takvim
│   │   │   └── health/       # Sağlık
│   │   ├── prisma/           # Şema
│   │   ├── common/           # Ortak
│   │   └── main.ts
│   ├── README.md             # Detaylı backend dokümanı
│   └── .env.example
│
├── web/                       # 📋 PLANLANIYOR - Next.js PWA
│   ├── src/
│   │   ├── app/              # App Router
│   │   ├── components/       # Bileşenler
│   │   ├── hooks/            # Hooks
│   │   ├── services/         # API
│   │   ├── store/            # State
│   │   └── styles/           # Stiller
│   ├── public/               # Statik
│   ├── README.md             # Web detaylı dokümanı
│   └── package.json
│
├── mobile/                    # 📋 PLANLANIYOR - React Native
│   ├── src/
│   │   ├── screens/          # Ekranlar
│   │   ├── components/       # Bileşenler
│   │   ├── navigation/       # Navigasyon
│   │   ├── services/        # API
│   │   └── store/            # State
│   ├── ios/                  # iOS
│   ├── android/              # Android
│   ├── README.md             # Mobil detaylı dokümanı
│   └── package.json
│
├── admin/                     # 📋 PLANLANIYOR - Next.js
│   ├── src/
│   │   ├── app/              # Sayfalar
│   │   ├── components/       # Bileşenler
│   │   └── services/         # API
│   ├── README.md             # Admin detaylı dokümanı
│   └── package.json
│
├── chrome-extension/          # 📋 PLANLANIYOR - Manifest V3
│   ├── src/
│   │   ├── background/       # Service Worker
│   │   ├── content/          # Content Script
│   │   ├── popup/            # Popup
│   │   └── options/          # Options
│   ├── icons/                # İkonlar
│   ├── README.md             # Eklenti detaylı dokümanı
│   └── manifest.json
│
├── .agents/                   # Agent yönergeleri
│   ├── AGENTS.md             # Kod kuralları
│   └── CLAUDE.md             # Claude yönergeleri
│
├── AVUKATPRO_MASTER_PLAN_v3.md   # Master plan
├── IMPLEMENTATION_PLAN_v1.md     # Uygulama planı
├── SYSTEM_SCHEMA.md               # Teknik şema
├── README.md                     # (bu dosya)
└── LICENSE                       # MIT
```

### 10.2 Backend Modüller (21 Adet)

| # | Modül | Açıklama | Endpoint Sayısı |
|---|-------|----------|-----------------|
| 1 | auth | JWT + OTP kimlik doğrulama | ~10 |
| 2 | users | Kullanıcı CRUD, arama | ~8 |
| 3 | cases | Dava dosyaları, duruşmalar | ~10 |
| 4 | notifications | Tebligatlar, 5 gün kuralı | ~12 |
| 5 | delegations | Tevkil pazarı | ~8 |
| 6 | documents | PDF/Word/UDF üretimi | ~6 |
| 7 | reminders | Hatırlatıcılar | ~5 |
| 8 | ai | Minimax + Claude hibrit | ~10 |
| 9 | admin | Admin panel API'leri | ~10 |
| 10 | uets | PTT UETS entegrasyonu | ~5 |
| 11 | uyap | UYAP Chrome eklentisi | ~5 |
| 12 | cron | 7 background job | - |
| 13 | rag | Pinecone RAG | ~5 |
| 14 | files | CloudFlare R2 | ~5 |
| 15 | payments | iyzico/PayTR/Stripe | ~8 |
| 16 | user-documents | Özlük dosyası | ~5 |
| 17 | icra | İcra takibi | ~8 |
| 18 | call-center | Borçlu arama | ~6 |
| 19 | calendar | Birleşik takvim | ~8 |
| 20 | notifications (multi-channel) | 5 kanal bildirim | ~8 |
| 21 | health | Sağlık kontrolü | ~2 |

---

## 11. Başlangıç & Kurulum

### 11.1 Gereksinimler

| Gereksinim | Minimum |
|------------|---------|
| Node.js | 18+ |
| PostgreSQL | 14+ |
| Redis | 6+ |
| npm/yarn | Son sürüm |

### 11.2 Kurulum Adımları

```bash
# 1. Projeyi klonlayın
git clone https://github.com/vadi360/AvukatPro.git
cd AvukatPro

# 2. Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run prisma:migrate
npm run start:dev

# 3. API'ye erişim
# http://localhost:3000/api/docs (Swagger)
```

### 11.3 Environment Değişkenleri

Detaylı liste için: [backend/README.md](backend/README.md#-yapılandırma)

---

## 12. Dokümantasyon

### 12.1 Ana Dokümanlar

| Doküman | Açıklama |
|---------|----------|
| [AVUKATPRO_MASTER_PLAN_v3.md](AVUKATPRO_MASTER_PLAN_v3.md) | Master ürün ve teknik plan |
| [IMPLEMENTATION_PLAN_v1.md](IMPLEMENTATION_PLAN_v1.md) | Uygulama planı, ekran tasarımları |
| [SYSTEM_SCHEMA.md](SYSTEM_SCHEMA.md) | Teknik şema, mimari |

### 12.2 Proje Bazlı Dokümanlar

| Proje | Doküman |
|-------|---------|
| Backend | [backend/README.md](backend/README.md) |
| Web | [web/README.md](web/README.md) |
| Mobil | [mobile/README.md](mobile/README.md) |
| Admin | [admin/README.md](admin/README.md) |
| Eklenti | [chrome-extension/README.md](chrome-extension/README.md) |

### 12.3 Agent Yönergeleri

| Dosya | Açıklama |
|-------|----------|
| [.agents/AGENTS.md](.agents/AGENTS.md) | Kod geliştirme kuralları |
| [.agents/CLAUDE.md](.agents/CLAUDE.md) | Claude özel yönergeler |

---

## 13. Roadmap

### 13.1 Geliştirme Planı

```
TAMAMLANDI ✓
━━━━━━━━━━━
Q1 2026 (Ocak - Mart)
└── Backend API
    ├── 21 Modül
    ├── 23 Prisma Model
    ├── ~90+ API Endpoint
    ├── AI (Minimax + Claude)
    └── 5 Bildirim Kanalı

PLANLANIYOR
━━━━━━━━━━━
Q2 2026 (Nisan - Haziran)
└── Web Uygulaması (Next.js + PWA)
    ├── Auth sayfaları
    ├── Dashboard
    ├── Dava yönetimi
    └── Takvim

Q3 2026 (Temmuz - Eylül)
└── Mobil Uygulama (React Native)
    ├── iOS
    └── Android

Q4 2026 (Ekim - Aralık)
└── Admin Panel
    ├── Kullanıcı yönetimi
    ├── AI config
    └── İstatistikler

2027
────
└── Chrome Eklentisi
    ├── UYAP scraping
    └── Otomatik özet
```

### 13.2 KPIs

| KPI | 6 Ay | 1 Yıl | 2 Yıl |
|-----|------|-------|-------|
| Kullanıcı | 10.000 | 25.000 | 100.000 |
| Gelir | 2M ₺ | 10M ₺ | 50M ₺ |
| Retention | %70 | %80 | %85 |

---

## 14. Katkı

### 14.1 Katkı Süreci

1. **Fork** yapın
2. **Feature branch** oluşturun
   ```bash
   git checkout -b feature/yeni-ozellik
   ```
3. **Commit** yapın
   ```bash
   git commit -m 'feat: yeni özellik eklendi'
   ```
4. **Push** yapın
   ```bash
   git push origin feature/yeni-ozellik
   ```
5. **Pull Request** açın

### 14.2 Kod Standartları

- TypeScript strict mode
- Türkçe yorumlar (her public method)
- ESLint + Prettier
- Test coverage > %80

Detaylı bilgi için: [.agents/AGENTS.md](.agents/AGENTS.md)

---

## 15. Lisans & İletişim

### 15.1 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır.

### 15.2 İletişim

| Kanal | Değer |
|-------|-------|
| **Website** | https://avukatpro.com |
| **GitHub** | https://github.com/vadi360/AvukatPro |
| **Email** | info@avukatpro.com |
| **Destek** | destek@avukatpro.com |

### 15.3 Sosyal Medya

| Platform | Hesap |
|----------|-------|
| LinkedIn | @avukatpro |
| Twitter | @avukatpro |
| Instagram | @avukatpro |

---

<div align="center">

*Bu proje Türkiye'nin hukuk ekosistemini güçlendirmek için ❤️ ile yapılmıştır.*

**AvukatPro — Hukuk Asistanı**

*© 2026 AvukatPro. Tüm hakları saklıdır.*

</div>