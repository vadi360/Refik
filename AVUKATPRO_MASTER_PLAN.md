# AvukatPro — Master Ürün & Teknik Plan

**Versiyon:** 1.0  
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

**Temel farklılaşma:**
- Mobil öncelikli tasarım (rakipler web ağırlıklı)
- Çift AI motoru (Minimax M2.7 + Claude) — maliyet/performans/gizlilik dengesi
- RAG tabanlı anti-halüsinasyon mimarisi
- Paket bazlı fiyatlandırma (199₺ – 1.999₺/ay)

**Hedef:** 6 ayda 10.000 avukat, 2 yılda Türkiye geneli 150.000 avukat.

**Başlangıç bütçesi:** 50.000 USD

---

## 2. Ürün Vizyonu & Değner Önerisi

### 2.1 Kime?
- **Birincil:** Solo avukatlar ve küçük hukuk büroları (4 kişiye kadar)
- **İkincil:** Orta ölçekli hukuk büroları (B2B paket)
- **Coğrafya:** Türkiye (ulusal)

### 2.2 Neden?
Avukatların %80'i:
- Tebligat takibini manuel yapıyor → süre kaçırıyor
- UYAP'ta dosya aramak için saat harcıyor
- Tevkil için "kime güveneceğimi" bilmiyor
- Dilekçe yazarken emsal/ içtihat araştırması yapamıyor

### 2.3 Değer Önerisi
| Pain | Çözüm |
|------|-------|
| Tebligat süresi kaçırma | AI analizli UETS entegrasyonu + otomatik hatırlatıcı |
| UYAP'ta saatlerce arama | Eklenti ile tek tıkla dosya özeti |
| Tevkil için güvenilir avukat bulma | Puanlama + konum + uzmanlık bazlı eşleştirme |
| Dilekçe yazarken emsal bulamama | RAG destekli içtihat araştırma |

### 2.4 Farklılaşma
- **Rakipler** (Forvis, Legal One, İdea Teknoloji): Web ağırlıklı, parçalı çözümler
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
2. Dosya numarasını girer → eklenti dosyayı çeker
3. RAG sistemi belgeleri okur → özet çıkarır
4. "Aleyhinize 2 karar, 1 bekleyen duruşma" gibi bilgi sunulur
5. Ayrıntı için UYAP'a gitmeye gerek kalmaz

### Senaryo 4 — Dilekçe Üretimi (Persona C)
1. Avukat "Boşanma dilekçesi" yazmak istiyor
2. Chatbot'a detayları girer (taraflar, Talepler)
3. Minimax taslak hazırlar → Claude kontrol eder
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

### 4.2 Modül 2 — UETS Entegrasyonu

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| UETS WebView entegrasyonu | MUST | PTT UETS sayfası uygulama içinde açılır |
| Otomatik tebligat çekme | MUST | 15 dakikada bir veya manuel |
| AI tebligat analizi | MUST | Tür çıkarımı (ara karar, duruşma, süreli bildirim) |
| Süre çıkarımı | MUST | "15 gün içinde itiraz" gibi bilgi |
| Hatırlatıcı oluşturma | MUST | Otomatik takvim + SMS + push |
| Tebligat arşivi | MUST | Geçmiş tebligatların listesi |

**Not:** UETS resmi API'si yoksa WebView otomasyonu kullanılacak. 2FA ve oturum yönetimi için e-imza/mobil imza gerekli.

### 4.3 Modül 3 — UYAP Dosya Özetleme

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| Chrome eklentisi | MUST | Avukat UYAP'ta gezinirken eklenti çalışır |
| Dosya çekme | MUST | Dosya numarası ile içerik çekme |
| RAG tabanlı özetleme | MUST | Belgeleri okuyup özet çıkarma |
| Aleyhe/lehe karar gösterimi | MUST | Özet içinde karar yönünü belirtme |
| Dosya durumu özeti | SHOULD | Bekleyen duruşmalar, son gelişmeler |
| Yerel depolama seçeneği | SHOULD | CloudFlare R2 veya müşteri Google Drive |

**Not:** UYAP resmi API'si yok. Eklenti scraping yapacak → ToS riski. "Okuma only" ve avukatın kendi hesabıyla giriş şart.

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

**UDF notu:** UDF zip+XML yapısında. Açık kaynak kütüphaneler mevcut (csharp, java). Üretim doğrulaması için test套装 gerekli.

---

### 4.5 Kesişen Yetenekler

| Özellik | Etiket | Açıklama |
|---------|--------|----------|
| Çift AI motoru yönlendirme | MUST | Minimax M2.7 + Claude kurallı görev dağılımı |
| Anti-halüsinasyon mimarisi | MUST | RAG + kaynak gösterme + "emin değilim" eşiği |
| İnsan onayı akışı | MUST | AI üretimi belgelerde avukat onayı zorunlu |
| Bildirim katmanı | MUST | Push, SMS (NetGSM), WhatsApp, e-posta |
| Abonelik yönetimi | MUST | Paket bazlı erişim, token limitleri |
| RAG altyapısı | MUST | Vektör veritabanı + embedding servisi |

---

## 5. Teknik Mimari

### 5.1 Sistem Diyagramı (Metinsel)

```
┌─────────────────────────────────────────────────────────────┐
│                        KULLANICI                             │
│                  (Avukat — Mobil / Web / Eklenti)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  React   │  │  React   │  │   Chrome     │  │  Mobile  │  │
│  │  Native  │  │   Web    │  │   Eklenti    │  │   App    │  │
│  │  (iOS)   │  │  (PWA)   │  │  (Extension) │  │ (Android)│  │
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
│  (JWT/OAuth) │ │  (Node)  │ │              │
└──────────────┘ └────┬─────┘ └──────┬───────┘
                      │             │
        ┌─────────────┼─────────────┼─────────────┐
        ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  PostgreSQL   │ │  Redis   │ │  RAG     │ │  AI          │
│  (Ana DB)     │ │  (Cache) │ │  System  │ │  Engines     │
└──────────────┘ └──────────┘ │          │ │ (Claude/     │
                              │ VectorDB │ │  Minimax)    │
                              │ (Pinecone│ │              │
                              │  /Weaviate│ └──────────────┘
                              └──────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│  UETS        │            │  UYAP        │            │  Bildirim   │
│  (WebView)   │            │  (Eklenti)   │            │  Servisleri │
│  PTT Entegre │            │  Scraping    │            │  (NetGSM,   │
│              │            │              │            │   WA, Email)│
└──────────────┘            └──────────────┘            └──────────────┘
```

### 5.2 Tech Stack Önerisi

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend Web** | Next.js + React | PWA, responsive, Türkçe UI |
| **Mobil** | React Native | iOS + Android, tek kod tabanı |
| **Eklenti** | Chrome Extension (Manifest V3) | UYAP okuma, arka plan scripti |
| **Backend API** | Node.js + NestJS veya Go | Mikroservis mimarisi |
| **Auth** | JWT + OAuth 2.0 + e-imza entegrasyonu | Çoklu oturum yönetimi |
| **Ana DB** | PostgreSQL | Müşteri, dosya, tevkil, paket verileri |
| **Cache** | Redis | Oturum, token, sıklık erişilen veriler |
| **Vektör DB** | Pinecone veya Weaviate (CloudFlare) | RAG için embeddings |
| **AI Gateway** | LangChain veya benzeri | Claude + Minimax yönlendirme |
| **Dosya Depo** | CloudFlare R2 veya S3 | Belgeler, arşivler |
| **SMS** | NetGSM API | Hatırlatıcı bildirimleri |
| **E-posta** | SendGrid veya Amazon SES | Bildirimler |
| **CI/CD** | GitHub Actions + Docker | Otomatik deployment |

### 5.3 Entegrasyon Katmanı

```
┌────────────────────────────────────────────────────────────┐
│                    ENTEGRASYON KATMANI                      │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ UETS/PTT    │    │ UYAP        │    │ Baro Doğrul │  │
│  │ WebView     │    │ Eklenti API │    │ -ama        │  │
│  │ Otomasyon   │    │ (Scraping)  │    │ (Baro APIs) │  │
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

### 6.1 Claude ↔ Minimax Yönlendirme Mantığı

```
┌─────────────────────────────────────────────────────────────┐
│                      AI GATEWAY                             │
│                   (LangChain + Rules)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────┐              ┌──────────────┐
│   Minimax    │              │   Claude     │
│   M2.7       │              │   (Sonnet)   │
│              │              │              │
│ Kullanım:    │              │ Kullanım:    │
│ - Büyük veri │              │ - Son karar  │
│   okuma      │              │   verme      │
│ - Hızlı      │              │ - Gizli veri │
│   analiz     │              │   işleme     │
│ - Düşük      │              │ - Yüksek     │
│   maliyet    │              │   doğruluk   │
└──────────────┘              └──────────────┘
```

**Kural Tablosu:**

| Görev | Model | Gerekçe |
|-------|-------|---------|
| Tebligat metni okuma & özetleme | Minimax | Hızlı, düşük maliyet, metin çeviri gerekmez |
| Dosya/belge RAG işleme | Minimax | Büyük belgeler, embedding üretimi |
| Dilekçe taslak üretimi | Minimax → Claude | Minimax üretir, Claude kontrol eder |
| İçtihat/emsal araştırma | Claude | Yüksek doğruluk gerekli |
| Karar analizi (aleyhe/lehe) | Claude | Hassas, hata kabul etmez |
| Gizli müvekkil verisi işleme | Claude | KVKK uyumluluğu, güvenlik |
| Basit Q&A (genel) | Minimax | Maliyet optimizasyonu |

**Çift onay mekanizması:** Minimax taslak üretir → Claude review eder → Avukat onaylar.

### 6.2 RAG / Anti-Halüsinasyon Tasarımı

```
┌─────────────────────────────────────────────────────────────┐
│                       RAG MİMARİSİ                          │
│                                                             │
│  1. Belge yüklenir                                          │
│         ▼                                                   │
│  2. Chunking (parçalama) — 512-1024 token parçalar         │
│         ▼                                                   │
│  3. Embedding üretimi (Minimax/Claude embed model)         │
│         ▼                                                   │
│  4. Vektör DB'ya kaydet (Pinecone/Weaviate)                │
│         │                                                   │
│         ▼                                                   │
│  5. Sorgu gelir → Vektör DB'de arama (similarity search)   │
│         │                                                   │
│         ▼                                                   │
│  6. En yakın belgeler çekilir (top-k)                      │
│         │                                                   │
│         ▼                                                   │
│  7. AI'a context olarak verilir + sorgu                    │
│         │                                                   │
│         ▼                                                   │
│  8. AI yanıt üretir → kaynak gösterir                      │
└─────────────────────────────────────────────────────────────┘
```

**Anti-halüsinasyon kuralları:**
- AI yanıtında mutlaka kaynak belirtilir (hangi belge/ sayfa)
- "Emin değilim" eşiği: %70 altında güven skoru → "Bu bilgiyi doğrulayamadım" yanıtı
- Her AI çıktısında "İnsan onayı zorunludur" notu
- RAG'de sadece avukatın kendi belgeleri kullanılır (harici internet yok)

### 6.3 Model-Görev Eşlemesi (Detaylı)

| Görev | Birincil Model | Yedek Model | Onay Gerekiyor mu? |
|-------|---------------|-------------|-------------------|
| UETS tebligat özetleme | Minimax | Claude | Hayır (otomatik) |
| Süre çıkarımı | Claude | — | Evet |
| UYAP dosya özeti | Minimax | Claude | Hayır |
| Aleyhe/lehe karar tespiti | Claude | — | Evet |
| Dilekçe taslak | Minimax | — | Evet |
| Dilekçe revizyon | Claude | Minimax | Evet |
| İhtarname | Minimax | Claude | Evet |
| İçtihat araştırma | Claude | — | Evet |
| Genel Q&A | Minimax | — | Hayır |

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
│ expertise   │       │ created_at  │       │ created_at  │
│ rating      │       └─────────────┘       └─────────────┘
│ subscription│               │
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

### 7.2 KVKK Uyum Stratejisi

| Risk | Azaltım Önlemi |
|------|----------------|
| Müvekkil verisi yurt dışına çıkması | Gizli veriler sadece Claude + Türkiye sunucusu |
| Veri yerelleştirme | PostgreSQL + vektör DB Türkiye'de (CloudFlare Istanbul) |
| Açık rıza | Kullanıcı onboarding'de KVKK metni + rıza onayı |
| Veri sorumlusu / işleyici ayrımı | SLA sözleşmesi + veri işleyici sözleşmesi |
| Silme hakkı | Kullanıcı verileri "sil" butonu ile 30 gün içinde imha |
| Veri ihlali | 72 saat bildirim + Bilişim Kurulu raporlama |

**Karar:** Müvekkil verileri yurt dışı LLM'e gönderilmez. Sadece genel sorular (dış kaynak yok) veya açık rıza alınmış özel durumlar için Claude kullanılır.

### 7.3 Şifreleme & Erişim

| Katman | Yöntem |
|--------|--------|
| Transit (aktarım) | TLS 1.3 |
| Dinlenme (depolama) | AES-256 |
| API anahtarları | AWS Secrets Manager veya HashiCorp Vault |
| İki faktörlü | e-imza veya mobil imza (kritik işlemler için) |
| Rol tabanlı erişim | Avukat, Büro Yöneticisi, Admin |

---

## 8. Yasal & Etik Uyum Analizi

### 8.1 Risk Matrisi

| Risk | Seviye | Azaltım |
|------|--------|---------|
| TBB iş aracılığı yasağı (komisyon) | 🔴 Yüksek | Komisyon alınmaz, abonelik modeli |
| Reklam yasağı | 🟡 Orta | Tanıtım "özellik tanıtımı" formatında yapılır |
| Avukatlık mesleki sırrı | 🔴 Yüksek | RAG verileri şifreli, sadece avukat erişir |
| UYAP ToS ihlali (scraping) | 🔴 Yüksek | Okuma-only, avukat kendi hesabı, sorumluluk reddi |
| UETS otomasyon | 🟡 Orta | WebView + oturum yönetimi, 2FA zorunlu |
| AI dilekçe hatası | 🔴 Yüksek | İnsan onayı zorunlu, sorumluluk reddi |
| KVKK cezası | 🔴 Yüksek | Türkiye veri merkezi, açık rıza, şifreleme |

### 8.2 Yasal Uyum Checklist

- [ ] KVKK açık rıza metni hazırlanacak (hukuk danışmanı ile)
- [ ] Veri işleme sözleşmesi şablonu hazırlanacak
- [ ] TBB meslek kuralları danışmanlığı alınacak
- [ ] AI sorumluluk reddi metni hazırlanacak
- [ ] UYAP eklentisi için "sorumluluk avukatındır" bildirimi
- [ ] UETS otomasyonu için hukuki görüş alınacak (PTT ile anlaşma?)

---

## 9. Fizibilite & Risk Matrisi

### 9.1 Entegrasyon Fizibilite Değerlendirmesi

| Entegrasyon | Durum | Risk | Çözüm |
|-------------|-------|------|-------|
| **UYAP Eklenti** | Resmi API yok | 🔴 Çok Yüksek | Scraping (okuma-only), avukat sorumluluğu, ToS riski kabul edilir |
| **UETS/PTT** | Resmi API yok | 🟡 Yüksek | WebView + otomasyon, 2FA yönetimi |
| **UDF Üretimi** | Format açık (internet kaynakları mevcut) | 🟡 Orta | Açık kaynak kütüphane (GitHub'da mevcut .NET/Java kütüphaneleri) |
| **RAG (CloudFlare)** | API mevcut | 🟢 Düşük | Vectorize + Workers AI kullanılabilir |
| **Robot Arama** | NetGSM API var | 🟢 Düşük | İYS uyumu sağlanır (ticari ileti onayı) |

### 9.2 UDF Formatı Hakkında

UDF (Uniform Document Format) = ZIP içinde XML yapısı.  
**Kaynak:** UDF üretimi için açık kaynak kütüphaneler mevcut. Örnek: `udf-dotnet` veya Java eşdeğerleri.  
**Öneri:** Önce PDF/Word ile başlanır, UDF Faz 2'de eklenir.

### 9.3 Risk Özet Tablosu

| Özellik | Fizibilite | Maliyet | Yasal Risk | Öncelik |
|---------|------------|---------|------------|--------|
| Tevkil Pazar Yeri | 🟢 Yüksek | Düşük | 🟡 Orta | MUST |
| UETS Entegrasyonu | 🟡 Orta | Orta | 🟡 Orta | MUST |
| UYAP Özetleme | 🔴 Düşük | Yüksek | 🔴 Yüksek | SHOULD |
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
- Chrome eklentisi (UYAP okuma)
- RAG altyapısı (CloudFlare Vectorize)
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

### 11.3 Maliyet Tahmini (Başlangıç)

| Kalem | Aylık Maliyet |
|-------|---------------|
| CloudFlare (R2 + Workers + Vectorize) | ~200₺ |
| Pinecone/Weaviate (Vektör DB) | ~150₺ |
| Claude API | ~500₺ (10K kullanıcı başlangıç) |
| Minimax API | ~300₺ |
| NetGSM SMS | ~100₺ (kullanıma bağlı) |
| Sunucu (AWS/GCP) | ~500₺ |
| **Toplam** | ~1.750₺/ay |

**10.000 avukat × 199₺ = 1.99M₺ gelir potansiyeli**  
Maliyet kullanıcı başına düşer → ölçeklenebilir.

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
2. **UDF format doğrulaması** için hangi kütüphane kullanılacak? (Daha detaylı araştırma gerekli)
3. **Baro entegrasyonu** için resmi API var mı? (Her baro farklı olabilir)
4. **e-imza zorunluluğu** hangi işlemler için geçerli? (Tevkil onayı, belge üretimi?)
5. **Veri yedekleme** ne sıklıkla? (RPO/RTO hedefleri)
6. **İYS (İleti Yönetim Sistemi)** kaydı yapılacak mı? (SMS için zorunlu)
7. **Uygulama içi mesajlaşma** (tevkil iletişimi için) gerekli mi?

### 13.2 Varsayımlar

| Varsayım | Açıklama |
|----------|----------|
| UYAP scraping tolere edilir | "Okuma-only" ve avukat kendi hesabıyla giriş şartıyla kabul edildi |
| UETS WebView otomasyonu yeterli | Resmi API yok, alternatif de yok |
| 50.000 USD MVP için yeterli | Faz 1'e kadar yeterli, Faz 2+ için ek yatırım gerekebilir |
| RAG için CloudFlare Vectorize yeterli | Düşük maliyet, hızlı başlangıç |
| Avukatlar mobil öncelikli tercih eder | Pazar araştırması doğrulamalı (anket?) |
| 10 kişilik çevre başlangıç için yeterli | Erken adaptör olarak yeterli, organik büyüme yeterli değilse ek pazarlama gerekli |

---

## EK — Hukuki Sorumluluk Reddi Metni (Önerilen)

> ⚠️ **Yasal Uyarı:** AvukatPro'da üretilen tüm belgeler ve AI çıktıları yalnızca yardımcı araç olarak tasarlanmıştır. Üretilen dilekçe, ihtarname veya süre bilgisi, avukatın kendi değerlendirmesi ve onayı olmadan kullanılamaz. AvukatPro, AI kaynaklı hatalardan kaynaklanan herhangi bir hukuki sonuçtan sorumlu değildir. Tüm belgeler kullanılmadan önce avukat tarafından kontrol edilmeli ve onaylanmalıdır.

---

*Plan tamamlandı.*  
*Son güncelleme: 01 Haziran 2026*  
*Versiyon: 1.0*