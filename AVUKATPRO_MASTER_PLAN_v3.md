# AvukatPro — Master Ürün & Teknik Plan

**Versiyon:** 3.0  
**Tarih:** 01 Haziran 2026  
**Durum:** Final  
**Gizlilik:** İç Kullanım  

---

## 1. Yönetici Özeti

**AvukatPro**, Türkiye'deki avukatlara yönelik, mobil öncelikli yapay zekâ destekli bir hukuk asistanı ve tevkil pazar yeridir. Dört ana modülden oluşur:

1. **Tevkil Pazar Yeri** — Avukatlar arası otomatik eşleştirme ile duruşma/işlem takibi
2. **UETS Entegrasyonu** — PTT UETS'ten tebligat çekme ve AI ile analiz
3. **UYAP Dosya Özetleme** — Tarayıcı eklentisi ile UYAP'tan dosya çekme ve RAG tabanlı özetleme
4. **Otomatik Belge Üretimi** — AI ile dilekçe, ihtarname, içtihat araştırması

**Tam Kapsam:**
- Web (Next.js + PWA)
- Mobil (React Native — iOS + Android)
- Chrome Eklentisi (Manifest V3)
- Backend API (Node.js/NestJS)
- Admin Panel

**Temel farklılaşma:**
- Mobil öncelikli tasarım (rakipler web ağırlıklı)
- **Hibrit AI Mimarisi** — Admin panelden her görev için Minimax veya Claude seçilebilir
- RAG tabanlı anti-halüsinasyon mimarisi (Pinecone vektör DB)
- Paket bazlı fiyatlandırma (199₺ – 1.999₺/ay)

**Hedef:** 6 ayda 10.000 avukat (organik + pazarlama), 2 yılda Türkiye geneli.

**Başlangıç bütçesi:** 50.000 USD

---

## 2. Ürün Vizyonu & Değer Önerisi

### 2.1 Kime?
- **Birincil:** Solo avukatlar ve küçük hukuk büroları (4 kişiye kadar)
- **İkincil:** Orta ölçekli hukuk büroları (B2B paket)
- **Coğrafya:** Türkiye (ulusal)

### 2.2 Neden?
Avukatlar:
- Tebligat takibini manuel yapıyor → süre kaçırabiliyor
- UYAP'ta dosya aramak için saat harcıyor
- Tevkil için güvenilir avukat bulmakta zorlanıyor
- Dilekçe yazarken emsal/içtihat araştırması yapamıyor

### 2.3 Değer Önerisi
| Pain | Çözüm |
|------|-------|
| Tebligat süresi kaçırma | AI analizli UETS entegrasyonu + otomatik hatırlatıcı |
| UYAP'ta saatlerce arama | Eklenti ile tek tıkla dosya özeti |
| Tevkil için güvenilir avukat bulma | Puanlama + konum + uzmanlık bazlı eşleştirme |
| Dilekçe yazarken emsal bulamama | RAG destekli içtihat araştırma |

### 2.4 Farklılaşma
- **Rakipler:** Forvis, Legal One, İdea Teknoloji, Apilex — web ağırlıklı, parçalı çözümler
- **AvukatPro:** Mobil öncelikli, uçtan uca AI destekli, hibrit AI seçeneği, paket bazlı

---

## 3. Kullanıcı Personaları & Ana Senaryolar

### Persona A — "Köşe Avukatı" (Solo)
- 5 yıllık deneyim, kendi ofisinde çalışıyor
- Aile hukuku odaklı, günde 2-3 duruşma
- Tek asistanı var, o da meşgul
- **Öncelik:** Tebligat takibi, duruşma hatırlatıcı, tevkil

### Persona B — "Büro Sahibi" (Kurumsal)
- 10 yıllık deneyim, 5 kişilik ekip
- Ceza ve icra davaları ağırlıklı
- Ekip yönetimi, dosya takibi kritik
- **Öncelik:** UYAP özetleme, ekip koordinasyonu, içtihat araştırması

### Persona C — "Genç Avukat" (Yeni)
- 1-2 yıllık deneyim, stajyerlikten yeni çıkmış
- Her dava türüne bakıyor, deneyim eksik
- Dilekçe yazımı ve emsal araştırması en çok ihtiyaç duyduğu şey
- **Öncelik:** Dilekçe üretimi, emsal karar, öğrenme

---

### Senaryo 1 — Tevkil Verme (Persona A)
1. Avukat UYAP'ta duruşma tarihini görür → gidemeyecek
2. AvukatPro uygulamasını açar → "Tevkil Ver" butonu
3. Sistem otomatik olarak aynı adliyede uygun avukatları listeler
4. Konum, uzmanlık, puan filtrelenir → öneriler sunulur
5. Avukat tevkil talebi gönderir → diğer avukat onaylar
6. Her iki taraf da bildirim alır → işlem tamam

### Senaryo 2 — Tebligat Analizi (Persona B)
1. Avukat UETS WebView'e giriş yapar (uygulama içinde)
2. Sistem otomatik olarak tebligat listesini çeker
3. **Okundu bilgisi kontrol edilir:**
   - **Açılmış tebligat:** Hemen indir → AI özet çıkar → hatırlatıcı oluştur
   - **Açılmamış + 5 gün geçti:** İndir → AI özet → hatırlatıcı oluştur
   - **Açılmamış + 5 gün geçmedi:** Sadece bildirim göster, bekle
4. AI analiz: "Ara karar, 14 gün içinde itiraz süresi" (süre = açılma tarihi + 14 gün)
5. Tebligat ilgili davaya eklenir → dosya yoksa yeni dava oluşturulur
6. Avukat detayları görür, gerekirse UYAP'a gider

### Senaryo 3 — UYAP Özetleme (Persona C)
1. Avukat Chrome'da UYAP'a girer → AvukatPro eklentisi aktif
2. Eklenti arka planda dosyaları çeker (avukat onayı ile)
3. RAG sistemi belgeleri okur → özet çıkarır
4. "Aleyhinize 2 karar, 1 bekleyen duruşma" gibi bilgi sunulur
5. Ayrıntı için UYAP'a gitmeye gerek kalmaz

### Senaryo 4 — Dilekçe Üretimi (Persona C)
1. Avukat "Boşanma dilekçesi" yazmak istiyor
2. Chatbot'a detayları girer (taraflar, Talepler)
3. AI (Admin'in seçtiği model) taslak hazırlar
4. Avukat revize ister → AI düzeltir
5. Son hal PDF/Word/UDF olarak çıkar

### Senaryo 5 — Otomatik İcra Takibi (Gelecek)
1. Avukat icra takip numarasını girer
2. Sistem UYAP icra modülünden durumu çeker
3. AI otomatik olarak takvim günceller
4. SMS/e-posta ile hatırlatma gider

---

## 4. Modül Bazlı Fonksiyonel Gereksinimler

### 4.1 Modül 1 — Tevkil Pazar Yeri

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| Tevkil talebi oluşturma | MUST | Avukat gidemediği duruşma/işlem için talep açabilir |
| Otomatik eşleştirme | MUST | Konum + uzmanlık + puan bazlı algoritma |
| Bildirim sistemi | MUST | Push + SMS + e-posta ile tevkil onayı |
| Tevkil geçmişi | MUST | Tamamlanmış tevkillerin kaydı |
| Avukat profili | MUST | Puan, uzmanlık alanları, adliye bilgisi |
| Yük dengeleme | SHOULD | Aynı avukata sürekli tevkil vermeme |
| OTP doğrulama | MUST | Kayıt sırasında telefon doğrulama |

**İş kuralları:**
- Tevkil ücretsizdir (komisyon alınmaz — TBB kuralı riski)
- Tevkil onayı 24 saat içinde verilmeli, verilmezse otomatik iptal
- Puanlama sistemi şeffaf, şikayet mekanizması açık
- Algoritma sadece eşleştirir, sıralama yapmaz (TBB riski azaltımı)

**Kayıt/Doğrulama:**
- Telefon numarası ile OTP kayıt
- Barodan ruhsat/evrak zorunluluğu yok (şimdilik basit başlangıç)
- Gelecekte baro entegrasyonu eklenebilir

### 4.2 Modül 2 — UETS Entegrasyonu

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| UETS WebView entegrasyonu | MUST | PTT UETS sayfası uygulama içinde açılır, kullanıcı giriş yapar, oturum açık kalır |
| Akıllı tebligat çekme | MUST | 5 günden eski tebligatlar otomatik indirilir, yenileri sadece bildirim |
| AI tebligat analizi | MUST | Tür çıkarımı (ara karar, duruşma, süreli bildirim) + özetleme |
| Süre çıkarımı | MUST | "15 gün içinde itiraz" gibi bilgi çıkarılır |
| Otomatik hatırlatıcı | MUST | Takvim + SMS + push (süreli bildirimlerde) |
| Otomatik dosyalama | MUST | Tebligat ilgili davaya eklenir, dosya yoksa oluşturulur |
| Tebligat arşivi | MUST | Tüm tebligatların listesi (indirilenler + yeni) |

**UETS Otomasyon Mantığı:**

```
┌─────────────────────────────────────────────────────────────┐
│                    UETS TEBLİGAT İŞLEME                     │
│                                                             │
│  1. WebView açılır → Avukat UETS'a giriş yapar             │
│         ▼                                                   │
│  2. Tebligat listesi çekilir                               │
│         ▼                                                   │
│  3. Her tebligat için kontrol:                             │
│                                                             │
│     ┌──────────────────────────────────────────────┐        │
│     │  "Okundu" durumu kontrolü                    │        │
│     │                                              │        │
│     │  AÇIKMIŞ (avukat okumuş) →                   │        │
│     │    → Hemen indir                             │        │
│     │    → AI özet çıkar                           │        │
│     │    → Hatırlatıcı oluştur                      │        │
│     │    → İlgili davaya ekle / yeni dava aç       │        │
│     │    (Süre başlamıştır, beklenemez!)           │        │
│     │                                              │        │
│     │  AÇILMAMIŞ →                                 │        │
│     │    → 5. gün kontrolü:                        │        │
│     │      5. gün geçti mi?                         │        │
│     │        EVET → İndir, işle                    │        │
│     │        HAYIR → Bekle, bildirimde göster      │        │
│     └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**İş akışı detayı:**
1. Avukat WebView'de UETS'e giriş yapar (bir kez, oturum açık kalır)
2. Sistem her 15 dakikada veya avukat "Güncelle" bastığında tebligat listesini çeker
3. Her tebligat için "okundu" durumu kontrol edilir:
   - **Açılmışsa:** Hemen indir → işle → hatırlatıcı oluştur
   - **Açılmamışsa:** 5. güne kadar bekle; 5. gün geçtiyse indir
4. AI özet çıkarır: "Ara karar, 14 gün içinde itiraz süresi var"
5. Hatırlatıcı: Avukat açtığı gün + X gün = cevap süresi
6. Dosya numarası varsa → mevcut davaya ekle; yoksa → yeni dava oluştur

**Örnek süre hesaplama:**
| Durum | Açılma tarihi | İşleme | Süre başlangıcı |
|-------|---------------|--------|-----------------|
| Avukat 1. gün açtı | 1. gün | Hemen | 1. gün + 14 gün = 15. gün sonu |
| Avukat 5. gün açtı | 5. gün | Hemen | 5. gün + 14 gün = 19. gün sonu |
| 5. gün açılmadı | 5. gün (UETS otomatik) | 5. gün | 5. gün + 14 gün = 19. gün sonu |

### 4.3 Modül 3 — UYAP Dosya Özetleme

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| Chrome eklentisi | MUST | Avukat UYAP'ta gezinirken eklenti çalışır |
| Full otomasyon | MUST | Arka planda dosya çekme (avukat onayı ile) |
| RAG tabanlı özetleme | MUST | Belgeleri okuyup özet çıkarma |
| Aleyhe/lehe karar gösterimi | MUST | Özet içinde karar yönünü belirtme |
| Dosya durumu özeti | SHOULD | Bekleyen duruşmalar, son gelişmeler |
| Yerel depolama | MUST | CloudFlare R2 üzerinde avukatın kendi alanı |

**Not:** UYAP resmi API'si yok. Eklenti scraping yapacak. Avukatın kendi hesabıyla giriş şart.

### 4.4 Modül 4 — Otomatik Belge Üretimi

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| Dilekçe üretimi | MUST | AI ile otomatik taslak hazırlama |
| İhtarname üretimi | MUST | Hukuki ihtarname şablonları |
| İçtihat/emsal araştırma | MUST | RAG destekli karar arama |
| Revize döngüsü | MUST | Avukat değişiklik ister → AI düzeltir |
| Çıktı formatları | MUST | PDF, Word, UDF |
| Dilekçe format kuralları | MUST | Şablon kütüphanesi (başlık, tarih, içerik yapısı) |
| Token limit yönetimi | MUST | Kullanım başına limit (fiyat paketine göre) |

**UDF notu:** UDF formatı araştırılacak. Önce PDF/Word ile başlanır.

### 4.5 Modül 5 — Otomatik İcra Takibi (Gelecek)

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| İcra takip numarası girişi | FUTURE | Avukat icra takip numarasını sisteme ekler |
| UYAP icra modülü entegrasyonu | FUTURE | İcra dosyasından durum çekme |
| Otomatik hatırlatıcı | FUTURE | Takvim + SMS ile icra tarihleri |
| e-imza entegrasyonu | FUTURE | Gelecekte icra işlemleri için gerekebilir |

---

### 4.6 Kesişen Yetenekler

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| **Hibrit AI Motoru** | MUST | Minimax ve Claude — Admin panelden yapılandırma |
| Anti-halüsinasyon mimarisi | MUST | RAG + kaynak gösterme + "emin değilim" eşiği |
| İnsan onayı akışı | MUST | AI üretimi belgelerde avukat onayı zorunlu |
| Bildirim katmanı | MUST | Push, SMS (NetGSM), WhatsApp, e-posta |
| Abonelik yönetimi | MUST | Paket bazlı erişim, token limitleri |
| RAG altyapısı | MUST | Pinecone vektör veritabanı + embedding servisi |
| Dosya depolama | MUST | CloudFlare R2 (dosya), Pinecone (vektör) |
| OTP doğrulama | MUST | Telefon numarası ile kayıt |

---

## 5. Teknik Mimari

### 5.1 Sistem Diyagramı (Metinsel)

```
┌─────────────────────────────────────────────────────────────┐
│                        KULLANICI                             │
│          (Avukat — Web / Mobil / Chrome Eklenti)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  React   │  │  Next.js │  │   Chrome     │  │  Mobile  │  │
│  │  Native  │  │   (Web)  │  │   Eklenti    │  │   App    │  │
│  │  (iOS)   │  │   (PWA)  │  │  (Ext. V3)   │  │(Android) │  │
│  │Android   │  │          │  │              │  │          │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  └────┬─────┘  │
└───────┼─────────────┼───────────────┼───────────────┼────────┘
        │             │               │               │
        └─────────────┴───────────────┴───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                              │
│                  (Kong / AWS API Gateway)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  Auth        │ │  Core    │ │  AI          │
│  Service     │ │  API     │ │  Gateway     │
│  (JWT/OAuth) │ │  (Node)  │ │  (Seçimli)   │
│  + OTP       │ │          │ │              │
└──────────────┘ └────┬─────┘ └──────┬───────┘
                      │             │
        ┌─────────────┼─────────────┼─────────────┐
        ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  PostgreSQL   │ │  Redis   │ │  RAG     │ │  AI Motorları │
│  (Ana DB)     │ │  (Cache) │ │  System  │ │              │
└──────────────┘ └──────────┘ │          │ │ ┌──────────┐ │
                              │Pinecone  │ │ │ Minimax  │ │
                              │(VektörDB)│ │ │ M2.7     │ │
                              └──────────┘ │ │(Türkiye) │ │
                                    │      │ └──────────┘ │
                                    │      │ ┌──────────┐ │
                                    │      │ │ Claude   │ │
                                    │      │ │ (Sonnet) │ │
                                    │      │ └──────────┘ │
                                    └──────────────┘
                                              │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│  UETS        │            │  UYAP        │            │  Bildirim   │
│  (WebView)   │            │  Eklenti     │            │  Servisleri │
│  PTT Entegre │            │  (Full Auto) │            │  (NetGSM,   │
│              │            │              │            │   WA, Email)│
└──────────────┘            └──────────────┘            └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ CloudFlare   │
                            │ R2 (Dosya)   │
                            └──────────────┘
```

### 5.2 Tech Stack Önerisi

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend Web** | Next.js + React | PWA, responsive, Türkçe UI |
| **Mobil** | React Native | iOS + Android, tek kod tabanı |
| **Eklenti** | Chrome Extension (Manifest V3) | UYAP okuma, full otomasyon |
| **Backend API** | Node.js + NestJS | Mikroservis mimarisi |
| **Auth** | JWT + OTP | Telefon doğrulama, çoklu oturum |
| **Admin Panel** | Next.js + React | Ayrı panel, yönetim araçları |
| **Ana DB** | PostgreSQL | Müşteri, dosya, tevkil, paket verileri |
| **Cache** | Redis | Oturum, token, sıklık erişilen veriler |
| **Vektör DB** | Pinecone | RAG için embeddings |
| **Dosya Depo** | CloudFlare R2 | Belgeler, arşivler |
| **AI Motoru 1** | Minimax M2.7 (Türkiye) | Varsayılan AI — veri Türkiye'de kalır |
| **AI Motoru 2** | Claude (Sonnet) | Admin seçimli — yüksek doğruluk gereken görevler |
| **SMS** | NetGSM API | Hatırlatıcı bildirimleri |
| **E-posta** | SendGrid veya Amazon SES | Bildirimler |
| **CI/CD** | GitHub Actions + Docker | Otomatik deployment |

### 5.3 Admin Panel Özellikleri

| Özellik | Açıklama |
|---------|----------|
| Kullanıcı yönetimi | Avukat kayıtları, OTP doğrulama, ban/suspend |
| Paket yönetimi | Fiyatlandırma, token limit, paket değişikliği |
| İçerik moderation | Tevkil şikayetleri, puanlama inceleme |
| Analitik dashboard | Kullanıcı sayısı, aktiflik, gelir |
| Sistem sağlığı | API durumu, eklenti çalışma durumu |
| Bildirim gönderme | Toplu push, SMS, e-posta |
| RAG yönetimi | Belge indeksleme durumu, embedding istatistikleri |
| **AI Yapılandırma** | Her görev için Minimax veya Claude seçimi |

---

## 6. AI Mimarisi — Hibrit Sistem

### 6.1 AI Stratejisi — Admin Kontrolünde

**Karar:** Sistemde **iki AI motoru** çalışır:
- **Minimax M2.7** (Türkiye sunucusu) — Varsayılan, KVKK uyumlu
- **Claude (Sonnet)** — Admin seçimli, yüksek doğruluk gereken görevler

**Yönetim:** Admin panelinden her görev türü için hangi AI'ın kullanılacağı seçilir. Bu seçim system genelinde geçerli olur.

### 6.2 AI Görev Atama Tablosu (Admin Yapılandırması)

| Görev | Minimax | Claude | Açıklama |
|-------|---------|--------|----------|
| Tebligat metni okuma & özetleme | ✅ | ⬜ | Hızlı analiz |
| Süre çıkarımı | ⬜ | ✅ | Hassas, kritik |
| UYAP dosya özeti | ✅ | ⬜ | RAG ile özetleme |
| Aleyhe/lehe karar tespiti | ⬜ | ✅ | Kritik karar |
| Dilekçe taslak üretimi | ✅ | ⬜ | Otomatik üretim |
| Dilekçe revizyon | ✅ | ⬜ | Revize döngüsü |
| İhtarname üretimi | ✅ | ⬜ | Otomatik üretim |
| İçtihat araştırma | ⬜ | ✅ | Yüksek doğruluk gerekli |
| Genel Q&A | ✅ | ⬜ | Basit sorular |

**Not:** Tablo varsayılan yapılandırmayı gösterir. Admin panelden değiştirilebilir.

### 6.3 Admin AI Yapılandırma Detayı

**Admin Panelinde:**
1. "AI Yapılandırma" menüsü
2. Görev listesi — her görevin yanında "Minimax" / "Claude" seçimi
3. Seçim kaydedildiğinde tüm sistem bu yapılandırmayı kullanır
4. İsteğe bağlı: Görev başına model override edilebilir (ileri aşamada)

**Varsayılan Kurulum:**
- Minimax: Tebligat, UYAP özet, dilekçe, ihtarname, genel Q&A
- Claude: Süre çıkarımı, aleyhe/lehe tespiti, içtihat araştırma

### 6.4 RAG / Anti-Halüsinasyon Tasarımı

```
┌─────────────────────────────────────────────────────────────┐
│                       RAG MİMARİSİ                          │
│                                                             │
│  1. Belge yüklenir (UYAP veya manuel)                      │
│         ▼                                                   │
│  2. Chunking (parçalama) — 512-1024 token parçalar         │
│         ▼                                                   │
│  3. Embedding üretimi (Minimax embed model)               │
│         ▼                                                   │
│  4. Pinecone vektör veritabanına kaydet                    │
│         │                                                   │
│         ▼                                                   │
│  5. Sorgu gelir → Pinecone'de arama (similarity search)    │
│         │                                                   │
│         ▼                                                   │
│  6. En yakın belgeler çekilir (top-k)                      │
│         │                                                   │
│         ▼                                                   │
│  7. AI'a context olarak verilir + sorgu                    │
│         │                                                   │
│         ▼                                                   │
│  8. AI yanıt üretir → kaynak gösterir                       │
└─────────────────────────────────────────────────────────────┘
```

**Depolama ayrımı:**
- **Pinecone:** Vektör embeddings (RAG araması için)
- **CloudFlare R2:** Asıl belgeler, PDF, Word dosyaları

**Anti-halüsinasyon kuralları:**
- AI yanıtında mutlaka kaynak belirtilir
- "Emin değilim" eşiği: %70 altında güven skoru → "Bu bilgiyi doğrulayamadım"
- Her AI çıktısında "İnsan onayı zorunludur" notu

---

## 7. Veri Modeli, Güvenlik & KVKK

### 7.1 Ana Veri Modeli

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │   Case      │       │  Document   │
│  (Avukat)   │───────│   (Dosya)   │───────│  (Belge)    │
│             │       │             │       │             │
│ id          │       │ id          │       │ id          │
│ name        │       │ case_number │       │ case_id     │
│ email       │       │ court       │       │ type        │
│ phone       │       │ parties     │       │ content     │
│ phone_verif │       │ status      │       │ embedding   │
│ baro_reg    │       │ created_at  │       │ file_url    │
│ expertise   │       └─────────────┘       │ (R2'de)     │
│ rating      │               │            │ created_at  │
│ subscription│               │            └─────────────┘
│ created_at  │               │
└─────────────┘               │
         │                    │
         ▼                    ▼
┌─────────────┐       ┌─────────────┐
│ Delegation  │       │ Reminder    │
│ (Tevkil)    │       │ (Hatırlatı) │
│             │       │             │
│ id          │       │ id          │
│ from_user   │       │ user_id     │
│ to_user     │       │ case_id     │
│ case_id     │       │ type        │
│ status      │       │ due_date    │
│ created_at  │       │ notify_type │
│ completed_at│       │ status      │
└─────────────┘       └─────────────┘
```

**User tablosu notu:** `baro_reg` alanı şimdilik boş veya basit doğrulama işareti.

### 7.2 KVKK Uyum Stratejisi

| Risk | Durum | Azaltım Önlemi |
|------|-------|----------------|
| Sınır ötesi veri aktarımı | ⚠️ Dikkat | Minimax Türkiye kullanılırsa risk yok. Claude kullanımında KVKK açık rıza gerekli |
| Veri yerelleştirme | ⚠️ Dikkat | Müvekkil verileri yurt dışına gönderilmez — Claude kullanımı için açık rıza alınır |
| Silme hakkı | ⚠️ Dikkat | "Sil" butonu ile 30 gün içinde imha |
| Veri ihlali | ⚠️ Önlem | TLS + AES-256, 72 saat bildirim |

**Claude Kullanımı İçin:** Müvekkil verileri işlenirken açık rıza alınacak veya veriler anonimize edilecek.

### 7.3 Şifreleme & Erişim

| Katman | Yöntem |
|--------|--------|
| Transit (aktarım) | TLS 1.3 |
| Dinlenme (depolama) | AES-256 |
| API anahtarları | AWS Secrets Manager veya HashiCorp Vault |
| Rol tabanlı erişim | Avukat, Büro Yöneticisi, Admin |

---

## 8. Yasal & Etik Uyum Analizi

### 8.1 Risk Matrisi

| Risk | Seviye | Azaltım |
|------|--------|---------|
| TBB iş aracılığı yasağı (komisyon) | 🔴 Yüksek | Komisyon alınmaz, abonelik modeli |
| TBB iş aracılığı (algoritma/eşleştirme) | 🟡 Orta | Algoritma sadece eşleştirir, sıralama yapmaz |
| Reklam yasağı | 🟡 Orta | "Özellik tanıtımı" formatında |
| Avukatlık mesleki sırrı | 🟢 Düşük | Veri Türkiye'de, şifreli, Claude için açık rıza |
| UYAP ToS ihlali (scraping) | 🔴 Yüksek | Okuma-only, avukat kendi hesabı, sorumluluk reddi |
| UETS otomasyon | 🟡 Orta | WebView + oturum yönetimi |
| AI dilekçe hatası | 🔴 Yüksek | İnsan onayı zorunlu, sorumluluk reddi |
| KVKK (Claude kullanımı) | 🟡 Orta | Açık rıza + anonimizasyon |

### 8.2 Yasal Uyum Checklist

- [ ] KVKK metni hazırlanacak
- [ ] AI sorumluluk reddi metni hazırlanacak
- [ ] UYAP eklentisi sorumluluk bildirimi
- [ ] Claude kullanımı için açık rıza metni
- [ ] TBB meslek kuralları danışmanlığı (gelecekte)

---

## 9. Fizibilite & Risk Matrisi

### 9.1 Entegrasyon Fizibilite Değerlendirmesi

| Entegrasyon | Durum | Risk | Çözüm |
|-------------|-------|------|-------|
| **UYAP Eklenti** | Resmi API yok | 🔴 Yüksek | Full otomasyon, scraping |
| **UETS/PTT** | Resmi API yok | 🟡 Orta | WebView + otomasyon (okundu + 5 gün kuralı) |
| **UDF Üretimi** | Format açık | 🟡 Orta | Açık kaynak kütüphane araştırılacak |
| **RAG (Pinecone)** | API mevcut | 🟢 Düşük | Pinecone Cloud |
| **Robot Arama** | NetGSM API var | 🟢 Düşük | İYS uyumu |

### 9.2 UETS WebView Otomasyon Detayı

**Nasıl çalışır:**
1. Avukat uygulamada UETS WebView'i açar
2. Kendi UETS bilgileriyle giriş yapar
3. Oturum açık kalır (cookies/session saklanır)
4. Sistem periyodik olarak (15 dakikada bir) tebligat listesini okur
5. Okundu durumu + 5 gün kuralına göre işlem yapar

**Riskler:**
- UETS oturumu zaman aşımına uğrarsa avukat tekrar giriş yapmalı
- UETS site değişikliği yaparsa eklenti bozulabilir

**Azaltım:**
- Oturum süresi kontrolü (uyarı ver)
- Tekrar deneme mekanizması
- Manuel "Yenile" butonu

---

## 10. MVP Tanımı & Faz Yol Haritası

### 10.1 MVP Kapsamı

**Faz 0 — Temel (Ay 1-2)**
- Web uygulaması (Next.js + PWA)
- Mobil uygulama iskeleti (React Native)
- Kullanıcı kayıt + OTP doğrulama
- Temel profil + puan sistemi
- Bildirim altyapısı (push + e-posta)
- Admin panel (temel + AI yapılandırma)

**Faz 1 — Tevkil + Tebligat (Ay 3-4)**
- Modül 1: Tevkil pazar yeri (2 taraflı)
- Modül 2: UETS WebView entegrasyonu + AI analizi
- Hatırlatıcı sistemi (SMS + push)

**Faz 2 — UYAP + RAG (Ay 5-6)**
- Chrome eklentisi (UYAP okuma + full otomasyon)
- RAG altyapısı (Pinecone vektör DB)
- Dosya özetleme + aleyhe/lehe tespiti

**Faz 3 — Belge Üretimi (Ay 7-8)**
- Modül 4: Dilekçe üretimi
- İçtihat araştırması
- UDF çıktısı

**Faz 4 — İcra Otomasyonu (Gelecek)**
- UYAP icra modülü entegrasyonu
- e-imza altyapısı hazırlığı

---

### 10.2 Çıkış Kriterleri

| Faz | Çıkış Kriteri |
|-----|---------------|
| Faz 0 | Login + OTP doğrulama = çalışıyor, Admin panel aktif, AI yapılandırma çalışıyor |
| Faz 1 | 10 gerçek tevkil, 50 tebligat analiz edildi |
| Faz 2 | 10 avukat eklenti kullanıyor, RAG doğru çalışıyor |
| Faz 3 | 10 dilekçe üretildi, avukat onayladı |

### 10.3 Zaman Çizelgesi

```
Ay 1-2   Ay 3-4   Ay 5-6   Ay 7-8   Gelecek
  │        │        │        │        │
  ▼        ▼        ▼        ▼        ▼
 Faz 0 → Faz 1 → Faz 2 → Faz 3 → Faz 4
 (MVP)  (Tevkil+ (UYAP+  (Belge  (İcra
        Tebligat) RAG)   Üretimi) Otomasyon)
```

---

## 11. İş Modeli & Fiyatlandırma

### 11.1 Fiyatlandırma Paketleri

| Paket | Fiyat | Özellikler |
|-------|-------|------------|
| **Basic** | 199₺/ay | Tebligat takibi, Tevkil, Hatırlatıcı, Görev yönetimi |
| **Standard** | 499₺/ay | Basic + UYAP entegrasyonu, Dosya analizi, Aleyhe/Lehe |
| **Professional** | 999₺/ay | Standard + Dilekçe, İhtarname, Revize, Token: 10.000/ay |
| **Enterprise** | 1.999₺/ay | Professional + İçtihat, Sınırsız RAG, Öncelik destek, Token: 50.000/ay |

### 11.2 Gelir Modeli

- **Birincil:** Aylık abonelik
- **İkincil:** Token aşım ücreti
- **Üçüncül:** B2B kurumsal paketler

**Komisyon YOK:** Tevkil ücretsiz.

### 11.3 Maliyet Tahmini (10.000 Kullanıcı)

| Kalem | Aylık Maliyet |
|-------|---------------|
| CloudFlare R2 | 2.000₺ |
| Pinecone | 3.000₺ |
| Minimax API | 15.000₺ |
| Claude API | Opsiyonel (kullanıma bağlı) |
| NetGSM SMS | 10.000₺ |
| Sunucu | 5.000₺ |
| **Toplam (Minimax only)** | ~35.000₺/ay |
| **Toplam (Minimax + Claude)** | ~40.000₺/ay |

**10.000 × 199₺ = 1.99M₺ gelir | 35-40K₺ maliyet | ~1.95M₺ net marj**

### 11.4 Başlangıç Maliyeti (MVP — İlk 3 Ay)

| Kalem | Aylık Maliyet |
|-------|---------------|
| CloudFlare R2 | 500₺ |
| Pinecone | 500₺ |
| Minimax API | 3.000₺ |
| NetGSM SMS | 500₺ |
| Sunucu | 2.000₺ |
| **Toplam** | ~6.500₺/ay |

---

## 12. Başarı Metrikleri (KPI)

### 12.1 Hedefler

| Metrik | 6. Ay | 12. Ay | 24. Ay |
|--------|-------|--------|--------|
| Aktif avukat | 10.000 | 40.000 | 150.000 |
| Tevkil/ay | 5.000 | 25.000 | 100.000 |
| Dilekçe/ay | 1.000 | 10.000 | 50.000 |
| Tebligat/ay | 50.000 | 200.000 | 1.000.000 |
| Retention | %60 | %70 | %80 |
| NPS | >50 | >60 | >70 |

**Büyüme stratejisi:** Organik + pazarlama (ikisi birlikte)

---

## 13. Açık Sorular & Varsayımlar

### 13.1 Açık Sorular

1. **UDF kütüphanesi:** Hangi açık kaynak kütüphane kullanılacak? (Araştırılacak)
2. **e-imza zamanlaması:** Faz 4 (icra otomasyonu) için e-imza ne zaman gerekli olacak?
3. **Baro entegrasyonu:** Gelecekte zorunlu olursa hangi barolarla entegrasyon?
4. **UYAP değişiklik takibi:** UYAP site değişirse eklenti güncelleme süreci nasıl yönetilir?
5. **Claude kullanım limiti:** Hangi görevlerde Claude kullanılacak? (Varsayılan: süre çıkarımı, içtihat, aleyhe/lehe)

### 13.2 Varsayımlar

| Varsayım | Açıklama |
|----------|----------|
| OTP kayıt yeterli | Başlangıçta baro doğrulaması yok, telefon yeterli |
| Organik + pazarlama | Büyüme her iki kanaldan gelecek |
| 50.000 USD yeterli | Faz 1'e kadar yeterli |
| Minimax Türkiye KVKK uyumlu | Veri Türkiye'de kalır |
| UYAP scraping tolere edilir | Okuma-only, avukat kendi hesabı |
| Admin AI seçimi yeterli | Hibrit sistem Admin kontrolünde çalışır |

---

## EK — Hukuki Sorumluluk Reddi Metni

> **Yasal Uyarı:** AvukatPro'da üretilen tüm belgeler ve AI çıktıları yalnızca yardımcı araç olarak tasarlanmıştır. Üretilen dilekçe, ihtarname veya süre bilgisi, avukatın kendi değerlendirmesi ve onayı olmadan kullanılamaz. AvukatPro, AI kaynaklı hatalardan kaynaklanan herhangi bir hukuki sonuçtan sorumlu değildir. Tüm belgeler kullanılmadan önce avukat tarafından kontrol edilmeli ve onaylanmalıdır.

---

## Değişiklik Özeti (v2.x'ten farklar)

| Değişiklik | Açıklama |
|------------|----------|
| **Hibrit AI sistemi** | Minimax + Claude — Admin panelden yapılandırma |
| **AI görev atama tablosu** | Net tablo, her görev için varsayılan model |
| **Admin AI yapılandırma** | Bölüm 6.3'te detaylı açıklama |
| **Claude KVKK notu** | Claude kullanımı için açık rıza gerekli |
| **Maliyet güncellemesi** | Claude opsiyonel olarak eklendi |
| **Versiyon 3.0** | Temiz konsolidasyon |

---

*Plan tamamlandı.*  
*Son güncelleme: 01 Haziran 2026*  
*Versiyon: 3.0*