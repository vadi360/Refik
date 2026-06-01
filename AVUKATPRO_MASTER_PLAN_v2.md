# AvukatPro — Master Ürün & Teknik Plan v2

**Versiyon:** 2.0  
**Tarih:** 01 Haziran 2026  
**Durum:** Final  
**Gizlilik:** İç Kullanım  
**Not:** AI mimarisi Minimax Türkiye sunucusu üzerine kuruludur. Kendi LLM entegrasyonu sonrası geçiş planlanmıştır.

---

## 1. Yönetici Özeti

**AvukatPro**, Türkiye'deki avukatlara yönelik, mobil öncelikli yapay zekâ destekli bir hukuk asistanı ve tevkil pazar yeridir. Dört ana modülden oluşur:

1. **Tevkil Pazar Yeri** — Avukatlar arası otomatik eşleştirme ile duruşma/işlem takibi
2. **UETS Entegrasyonu** — PTT UETS'ten tebligat çekme ve AI ile analiz
3. **UYAP Dosya Özetleme** — Tarayıcı eklentisi ile UYAP'tan dosya çekme ve RAG tabanlı özetleme
4. **Otomatik Belge Üretimi** — AI ile dilekçe, ihtarname, içtihat araştırması

**Temel farklılaşma:**
- Mobil öncelikli tasarım (rakipler web ağırlıklı)
- Minimax M2.7 Türkiye sunucusu — veri Türkiye'de kalır, KVKK uyumlu
- RAG tabanlı anti-halüsinasyon mimarisi (Pinecone vektör DB)
- Paket bazlı fiyatlandırma (199₺ – 1.999₺/ay)

**Hedef:** 6 ayda 10.000 avukat, 2 yılda Türkiye geneli 150.000 avukat.

**Başlangıç bütçesi:** 50.000 USD

---

## 2. Ürün Vizyonu & Değer Önerisi

### 2.1 Kime?
- **Birincil:** Solo avukatlar ve küçük hukuk büroları (4 kişiye kadar)
- **İkincil:** Orta ölçekli hukuk büroları (B2B paket)
- **Coğrafya:** Türkiye (ulusal)

### 2.2 Neden?
Avukatların önemli bir kısmı:
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
- **AvukatPro:** Mobil öncelikli, uçtan uca AI destekli, paket bazlı

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
4. Konum, uzmanlık, puan filtrelenir → 3 öneri sunulur
5. Avukat tevkil talebi gönderir → diğer avukat onaylar
6. Her iki taraf da bildirim alır → işlem tamam

### Senaryo 2 — Tebligat Analizi (Persona B)
1. UETS'ten tebligat çekilir (uygulama içi WebView)
2. AI tebligatı okur → "Ara karar, 15 gün içinde itiraz süresi" çıkarır
3. Otomatik hatırlatıcı oluşturulur → takvim + SMS
4. Avukat karar detayını görür, gerekirse UYAP'a gider

### Senaryo 3 — UYAP Özetleme (Persona C)
1. Avukat Chrome'da UYAP'a girer → AvukatPro eklentisi aktif
2. Eklenti arka planda dosyaları çeker (avukat onayı ile)
3. RAG sistemi belgeleri okur → özet çıkarır
4. "Aleyhinize 2 karar, 1 bekleyen duruşma" gibi bilgi sunulur
5. Ayrıntı için UYAP'a gitmeye gerek kalmaz

### Senaryo 4 — Dilekçe Üretimi (Persona C)
1. Avukat "Boşanma dilekçesi" yazmak istiyor
2. Chatbot'a detayları girer (taraflar, Talepler)
3. Minimax taslak hazırlar
4. Avukat revize ister → AI düzeltir
5. Son hal PDF/Word/UDF olarak çıkar

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
| Baro doğrulaması | MUST | Avukat kimliği barodan doğrulanır |

**İş kuralları:**
- Tevkil ücretsizdir (komisyon alınmaz — TBB kuralı riski)
- Tevkil onayı 24 saat içinde verilmeli, verilmezse otomatik iptal
- Puanlama sistemi şeffaf, şikayet mekanizması açık
- Algoritma sadece eşleştirir, sıralama yapmaz (TBB riski azaltımı)

### 4.2 Modül 2 — UETS Entegrasyonu

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| UETS WebView entegrasyonu | MUST | PTT UETS sayfası uygulama içinde açılır |
| Otomatik tebligat çekme | MUST | Periyodik veya manuel |
| AI tebligat analizi | MUST | Tür çıkarımı (ara karar, duruşma, süreli bildirim) |
| Süre çıkarımı | MUST | "15 gün içinde itiraz" gibi bilgi |
| Hatırlatıcı oluşturma | MUST | Otomatik takvim + SMS + push |
| Tebligat arşivi | MUST | Geçmiş tebligatların listesi |

**Not:** UETS resmi API'si yoksa WebView otomasyonu kullanılacak. Oturum yönetimi için avukat kendi UETS bilgilerini girer.

### 4.3 Modül 3 — UYAP Dosya Özetleme

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| Chrome eklentisi | MUST | Avukat UYAP'ta gezinirken eklenti çalışır |
| Full otomasyon | MUST | Arka planda dosya çekme (avukat onayı ile) |
| RAG tabanlı özetleme | MUST | Belgeleri okuyup özet çıkarma |
| Aleyhe/lehe karar gösterimi | MUST | Özet içinde karar yönünü belirtme |
| Dosya durumu özeti | SHOULD | Bekleyen duruşmalar, son gelişmeler |
| Yerel depolama | MUST | CloudFlare R2 üzerinde avukatın kendi alanı |

**Not:** UYAP resmi API'si yok. Eklenti scraping yapacak. Avukatın kendi hesabıyla giriş şart. "Okuma-only" prensibi.

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

**UDF notu:** UDF zip+XML yapısında. Açık kaynak kütüphaneler araştırılacak. Üretim doğrulaması için test gerektirir.

---

### 4.5 Kesişen Yetenekler

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| AI motoru | MUST | Minimax M2.7 (Türkiye sunucusu) — veri Türkiye'de kalır |
| Anti-halüsinasyon mimarisi | MUST | RAG + kaynak gösterme + "emin değilim" eşiği |
| İnsan onayı akışı | MUST | AI üretimi belgelerde avukat onayı zorunlu |
| Bildirim katmanı | MUST | Push, SMS (NetGSM), WhatsApp, e-posta |
| Abonelik yönetimi | MUST | Paket bazlı erişim, token limitleri |
| RAG altyapısı | MUST | Pinecone vektör veritabanı + embedding servisi |
| Dosya depolama | MUST | CloudFlare R2 (dosya), Pinecone (vektör) — ikisi farklı |

---

## 5. Teknik Mimari

### 5.1 Sistem Diyagramı (Metinsel)

```
┌─────────────────────────────────────────────────────────────┐
│                        KULLANICI                             │
│                  (Avukat — Mobil / Web / Eklenti)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  React   │  │  Next.js │  │   Chrome     │  │  Mobile  │  │
│  │  Native  │  │   (Web)  │  │   Eklenti    │  │   App    │  │
│  │  (iOS)   │  │   (PWA)  │  │  (Ext. V3)   │  │(Android) │  │
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
│  (JWT/OAuth) │ │  (Node)  │ │  (Minimax)   │
└──────────────┘ └────┬─────┘ └──────┬───────┘
                      │             │
        ┌─────────────┼─────────────┼─────────────┐
        ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  PostgreSQL   │ │  Redis   │ │  RAG     │ │  Minimax     │
│  (Ana DB)     │ │  (Cache) │ │  System  │ │  M2.7        │
└──────────────┘ └──────────┘ │          │ │ (Türkiye)    │
                              │Pinecone  │ │              │
                              │(VektörDB)│ └──────────────┘
                              └──────────┘
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
| **Backend API** | Node.js + NestJS veya Go | Mikroservis mimarisi |
| **Auth** | JWT + OAuth 2.0 | Çoklu oturum yönetimi |
| **Ana DB** | PostgreSQL | Müşteri, dosya, tevkil, paket verileri |
| **Cache** | Redis | Oturum, token, sıklık erişilen veriler |
| **Vektör DB** | Pinecone | RAG için embeddings |
| **Dosya Depo** | CloudFlare R2 | Belgeler, arşivler |
| **AI Motoru** | Minimax M2.7 (Türkiye sunucusu) | Tüm AI işlemleri — veri Türkiye'de kalır |
| **SMS** | NetGSM API | Hatırlatıcı bildirimleri |
| **E-posta** | SendGrid veya Amazon SES | Bildirimler |
| **CI/CD** | GitHub Actions + Docker | Otomatik deployment |

**Depolama Notu:** CloudFlare R2 ve Pinecone farklı ürünlerdir:
- **CloudFlare R2:** Belgeler, PDF, Word dosyaları gibi büyük dosyaların depolandığı yer
- **Pinecone:** RAG için vektör embeddings'in saklandığı veritabanı

### 5.3 Entegrasyon Katmanı

```
┌────────────────────────────────────────────────────────────┐
│                    ENTEGRASYON KATMANI                      │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ UETS/PTT    │    │ UYAP        │    │ Baro Doğrul │  │
│  │ WebView     │    │ Eklenti API │    │ -ama        │  │
│  │ Otomasyon   │    │ (Full Auto) │    │ (Baro APIs) │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                            │                              │
│                            ▼                              │
│                   ┌─────────────────┐                     │
│                   │  Error Handler  │                    │
│                   │  Rate Limiter   │                    │
│                   │  Retry Logic    │                    │
│                   └─────────────────┘                     │
└────────────────────────────────────────────────────────────┘
```

---

## 6. AI Mimarisi

### 6.1 AI Stratejisi — Minimax Türkiye

**Karar:** Tüm AI işlemleri Minimax M2.7 üzerinden çalışır. Minimax Türkiye sunucusunda barınır → veri Türkiye'de kalır → KVKK riski yok.

**Gelecek:** Kendi LLM entegrasyonu planlanıyor (henüz tamamlanmadı). Tamamlandığında Miminal + kendi model hibrit yapıya geçilecek.

### 6.2 Minimax Yönlendirme Mantığı

```
┌─────────────────────────────────────────────────────────────┐
│                      AI GATEWAY                             │
│                   (LangChain + Rules)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Minimax M2.7                            │
│                  (Türkiye Sunucusu)                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Okuma &     │  │ Özetleme &  │  │ Dilekçe &   │        │
│  │ Analiz      │  │ Çıkarım     │  │ Üretim      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Kural Tablosu:**

| Görev | Açıklama | Onay Gerekiyor mu? |
|-------|----------|-------------------|
| Tebligat metni okuma & özetleme | Hızlı analiz | Hayır (otomatik) |
| Süre çıkarımı | "15 gün içinde itiraz" çıkarımı | Evet |
| UYAP dosya özeti | Belgelerin RAG ile özetlenmesi | Hayır |
| Aleyhe/lehe karar tespiti | Karar yönü belirlenmesi | Evet |
| Dilekçe taslak | Otomatik üretim | Evet |
| Dilekçe revizyon | Revize döngüsü | Evet |
| İhtarname | Otomatik üretim | Evet |
| İçtihat araştırma | RAG destekli arama | Evet |
| Genel Q&A | Basit sorular | Hayır |

### 6.3 RAG / Anti-Halüsinasyon Tasarımı

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

**Depolama açıklaması:**
- **Pinecone:** Vektör embeddings saklar (RAG araması için) — arama hızı için
- **CloudFlare R2:** Asıl belgeler (PDF, Word) saklar — uzun süreli depolama için

**Anti-halüsinasyon kuralları:**
- AI yanıtında mutlaka kaynak belirtilir (hangi belge/sayfa)
- "Emin değilim" eşiği: %70 altında güven skoru → "Bu bilgiyi doğrulayamadım" yanıtı
- Her AI çıktısında "İnsan onayı zorunludur" notu
- RAG'de sadece avukatın kendi belgeleri kullanılır

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
│ baro_id     │       │ status      │       │ embedding   │
│ expertise   │       │ created_at  │       │ file_url    │
│ rating      │       └─────────────┘       │ (R2'de)     │
│ subscription│               │            │ created_at  │
│ created_at  │               │            └─────────────┘
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

### 7.2 KVKK Uyum Stratejisi

**Durum:** Tüm AI işlemleri Minimax Türkiye sunucusunda çalışır → veri Türkiye'de kalır → KVKK sınır ötesi aktarım riski yok.

| Risk | Durum | Azaltım Önlemi |
|------|-------|----------------|
| Sınır ötesi veri aktarımı | ✅ Yok | Minimax Türkiye sunucusu kullanılıyor |
| Açık rıza | ✅ Gerekli değil | Veri yurt dışına çıkmıyor |
| Veri yerelleştirme | ✅ Uyumlu | Tüm veri Türkiye'de |
| Silme hakkı | ⚠️ Dikkat | Kullanıcı verileri "sil" butonu ile imha |
| Veri ihlali | ⚠️ Önlem | TLS + AES-256 şifreleme, 72 saat bildirim |

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
| Reklam yasağı | 🟡 Orta | Tanıtım "özellik tanıtımı" formatında yapılır |
| Avukatlık mesleki sırrı | 🟢 Düşük | Veri Türkiye'de, şifreli, sadece avukat erişir |
| UYAP ToS ihlali (scraping) | 🔴 Yüksek | Okuma-only, avukat kendi hesabı, sorumluluk reddi |
| UETS otomasyon | 🟡 Orta | WebView + oturum yönetimi |
| AI dilekçe hatası | 🔴 Yüksek | İnsan onayı zorunlu, sorumluluk reddi |
| KVKK | 🟢 Düşük | Veri Türkiye'de, KVKK uyumlu |

### 8.2 Tevkil Yasal Uyum Detayı

**TBB Meslek Kuralları md. 47:** "Avukat, iş getirme veya müvekkil getirme karşılığında komisyon veremez."

**Risk analizi:**
- Komisyon alınmaz → bu risk yok
- Algoritma sadece eşleştirir → "iş aracılığı" değil, "teknik altyapı"
- Avukat kendi seçim yapar → algoritma zorlamaz

**Öneri:** Platform "pasif eşleştirme" olarak konumlandırılır. Sıralama yok, sadece filtreleme. Puanlama şeffaf ve herkese açık.

### 8.3 UYAP Yasal Uyum Detayı

**Durum:** UYAP resmi API sunmaz. Eklenti scraping yapar.

**Gerçek riskler:**
1. UYAP IP ban atabilir
2. Avukatın hesabı askıya alınabilir (teorik)
3. UYAP ToS değişirse platform çalışmaz

**Önlemler:**
- "Okuma-only" prensibi — veri yazılmaz
- Avukatın kendi hesabı — biz veri çekmeyiz, avukat çekiyor
- Sorumluluk reddi metni — avukat riski kabul eder
- Kullanıcı onaylı full otomasyon — avukat tetikler, biz çalıştırırız

### 8.4 Yasal Uyum Checklist

- [ ] KVKK açık rıza metni hazırlanacak (hukuk danışmanı ile)
- [ ] Veri işleme sözleşmesi şablonu hazırlanacak
- [ ] TBB meslek kuralları danışmanlığı alınacak
- [ ] AI sorumluluk reddi metni hazırlanacak
- [ ] UYAP eklentisi için "sorumluluk avukatındır" bildirimi
- [ ] UETS otomasyonu için hukuki görüş alınacak

---

## 9. Fizibilite & Risk Matrisi

### 9.1 Entegrasyon Fizibilite Değerlendirmesi

| Entegrasyon | Durum | Risk | Çözüm |
|-------------|-------|------|-------|
| **UYAP Eklenti** | Resmi API yok | 🔴 Yüksek | Full otomasyon (avukat onayı ile), scraping |
| **UETS/PTT** | Resmi API yok | 🟡 Orta | WebView + otomasyon |
| **UDF Üretimi** | Format açık | 🟡 Orta | Araştırma gerekli (açık kaynak kütüphane bulunacak) |
| **RAG (Pinecone)** | API mevcut | 🟢 Düşük | Pinecone Cloud kullanılabilir |
| **Robot Arama** | NetGSM API var | 🟢 Düşük | İYS uyumu sağlanır |

### 9.2 UDF Formatı Hakkında

UDF (Uniform Document Format) = ZIP içinde XML yapısı.  
**Durum:** Açık kaynak kütüphane araştırması gerekli. Planda varsayılan kütüphane ismi yok — doğrulama yapılacak.  
**Öneri:** Önce PDF/Word ile başlanır, UDF Faz 2'de eklenir.

### 9.3 Risk Özet Tablosu

| Özellik | Fizibilite | Maliyet | Yasal Risk | Öncelik |
|---------|------------|---------|------------|--------|
| Tevkil Pazar Yeri | 🟢 Yüksek | Düşük | 🟡 Orta | MUST |
| UETS Entegrasyonu | 🟡 Orta | Orta | 🟡 Orta | MUST |
| UYAP Özetleme | 🔴 Düşük | Yüksek | 🔴 Yüksek | MUST |
| Dilekçe Üretimi | 🟢 Yüksek | Orta | 🟡 Orta | MUST |
| İçtihat Araştırma | 🟢 Yüksek | Orta | 🟢 Düşük | MUST |

---

## 10. MVP Tanımı & Faz Yol Haritası

### 10.1 MVP Kapsamı

**Faz 0 — Temel (Ay 1-2)**
- Mobil uygulama iskeleti (React Native)
- Kullanıcı kayıt + baro doğrulama
- Temel profil + puan sistemi
- Bildirim altyapısı (push + e-posta)

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
- UDF çıktısı (Faz 3 sonu)

---

### 10.2 Çıkış Kriterleri

| Faz | Çıkış Kriteri |
|-----|---------------|
| Faz 0 | Login + baro doğrulama = çalışıyor |
| Faz 1 | 10 gerçek tevkil yapıldı, 50 tebligat analiz edildi |
| Faz 2 | 10 avukat eklenti kullanıyor, RAG araması doğru çalışıyor |
| Faz 3 | 10 dilekçe üretildi, avukat onayladı |

### 10.3 Zaman Çizelgesi

```
Ay 1-2   Ay 3-4   Ay 5-6   Ay 7-8
  │        │        │        │
  ▼        ▼        ▼        ▼
 Faz 0 → Faz 1 → Faz 2 → Faz 3
 (MVP)  (Tevkil+ (UYAP+  (Belge
        Tebligat) RAG)   Üretimi)
```

---

## 11. İş Modeli & Fiyatlandırma

### 11.1 Fiyatlandırma Paketleri

| Paket | Fiyat | Özellikler |
|-------|-------|------------|
| **Basic** | 199₺/ay | Tebligat takibi, Tevkil verme/alma, Hatırlatıcı, Görev yönetimi |
| **Standard** | 499₺/ay | Basic + UYAP entegrasyonu, Dosya analizi, Aleyhe/Lehe tespiti |
| **Professional** | 999₺/ay | Standard + Dilekçe üretimi, İhtarname, Revize döngüsü, Token limit: 10.000/ay |
| **Enterprise** | 1.999₺/ay | Professional + İçtihat araştırması, Sınırsız RAG, Öncelik destek, Token limit: 50.000/ay |

**Not:** Token limit aşımında GB başına ücretlendirme.

### 11.2 Gelir Modeli

- **Birincil:** Aylık abonelik
- **İkincil:** Token aşım ücreti
- **Üçüncül:** (Faz 3 sonrası) Kurumsal B2B paketleri

**Komisyon YOK:** Tevkil ücretsizdir. TBB meslek kuralları riski nedeniyle.

### 11.3 Maliyet Tahmini (10.000 Kullanıcı Senaryosu)

| Kalem | Aylık Maliyet |
|-------|---------------|
| CloudFlare R2 (Dosya depolama) | 2.000₺ |
| Pinecone (Vektör DB) | 3.000₺ |
| Minimax API (Türkiye sunucusu) | 15.000₺ |
| NetGSM SMS (kullanıma bağlı) | 10.000₺ |
| Sunucu (AWS/GCP) | 5.000₺ |
| **Toplam** | ~35.000₺/ay |

**10.000 avukat × 199₺ = 1.99M₺ gelir**  
**Maliyet: ~35.000₺/ay**  
**Net marj: ~1.95M₺/ay**

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
| Tevkil sayısı/ay | 5.000 | 25.000 | 100.000 |
| Dilekçe üretimi/ay | 1.000 | 10.000 | 50.000 |
| Tebligat analizi/ay | 50.000 | 200.000 | 1.000.000 |
| Retention (6 ay) | %60 | %70 | %80 |
| NPS (Net Promoter Score) | >50 | >60 | >70 |

### 12.2 Ölçümleme Araçları

- **Product analytics:** Mixpanel veya Amplitude
- **Hata izleme:** Sentry
- **APM:** Datadog veya CloudFlare Analytics
- **Müşteri memnuniyeti:** In-app anket + NPS

---

## 13. Açık Sorular & Varsayımlar Listesi

### 13.1 Açık Sorular

1. **UETS resmi API başvurusu** yapılacak mı? (PTT ile resmi entegrasyon anlaşması)
2. **UDF format** için hangi kütüphane kullanılacak? (Araştırma gerekli)
3. **Baro entegrasyonu** için hangi barolarla çalışılacak? (İstanbul/Ankara öncelikli mi?)
4. **e-imza zorunluluğu** hangi işlemler için geçerli?
5. **Veri yedekleme** ne sıklıkla? (RPO/RTO hedefleri)
6. **İYS (İleti Yönetim Sistemi)** kaydı yapılacak mı? (SMS için zorunlu)
7. **Uygulama içi mesajlaşma** (tevkil iletişimi için) gerekli mi?
8. **Kendi LLM entegrasyonu** ne zaman tamamlanır? (Minimax'ten geçiş planı)

### 13.2 Varsayımlar

| Varsayım | Açıklama |
|----------|----------|
| Minimax Türkiye sunucusu KVKK uyumlu | Veri Türkiye'de kalır, sınır ötesi aktarım yok |
| UYAP scraping tolere edilir | "Okuma-only" ve avukat kendi hesabıyla giriş şartıyla kabul edildi |
| UETS WebView otomasyonu yeterli | Resmi API yok, alternatif de yok |
| 50.000 USD MVP için yeterli | Faz 1'e kadar yeterli, Faz 2+ için ek yatırım gerekebilir |
| 10K avukat 6 ayda ulaşılabilir | Ek pazarlama bütçesi gerekebilir |
| Apilex, Forvis, Legal One, İdea Teknoloji = ana rakipler | Pazar araştırması doğrulamalı |

---

## EK — Hukuki Sorumluluk Reddi Metni (Önerilen)

> **Yasal Uyarı:** AvukatPro'da üretilen tüm belgeler ve AI çıktıları yalnızca yardımcı araç olarak tasarlanmıştır. Üretilen dilekçe, ihtarname veya süre bilgisi, avukatın kendi değerlendirmesi ve onayı olmadan kullanılamaz. AvukatPro, AI kaynaklı hatalardan kaynaklanan herhangi bir hukuki sonuçtan sorumlu değildir. Tüm belgeler kullanılmadan önce avukat tarafından kontrol edilmeli ve onaylanmalıdır.

---

## v2 Değişiklik Özeti

| Değişiklik | v1'den farkı |
|------------|--------------|
| AI Mimarisı | Tüm veri Minimax Türkiye → KVKK riski yok |
| Maliyet hesabı | 10K kullanıcıda ~35.000₺/ay (doğrulandı) |
| Storage açıklaması | CloudFlare R2 (dosya) vs Pinecone (vektör) ayrımı netleştirildi |
| UYAP otomasyonu | Full otomasyon (avukat onayı ile) |
| Rakipler | Apilex eklendi |
| Maliyet matematiği | "1.750₺" → "~35.000₺" (10K kullanıcıda) |
| Çelişki çözüldü | Bölüm 6 vs Bölüm 7 KVKK çelişkisi kaldırıldı |

---

*Plan tamamlandı.*  
*Son güncelleme: 01 Haziran 2026*  
*Versiyon: 2.0*