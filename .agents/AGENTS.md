# AvukatPro — Agent Kullanım Kılavuzu

**Versiyon:** 1.0  
**Tarih:** 02 Haziran 2026  
**Gizlilik:** İç Kullanım

---

## 1. Genel Bakış

Bu proje **Craft Agent** ile geliştirilmiştir. Aşağıdaki kurallar ve yönergeler tüm kod geliştirme sürecini yönetir.

---

## 2. Proje Yapısı

```
AvukatPro/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── modules/           # 21 modül
│   │   │   ├── auth/          # JWT + OTP kimlik doğrulama
│   │   │   ├── users/        # Kullanıcı yönetimi
│   │   │   ├── cases/        # Dava dosyaları
│   │   │   ├── hearings/     # Duruşmalar
│   │   │   ├── notifications/# Tebligatlar
│   │   │   ├── delegations/  # Tevkil pazarı
│   │   │   ├── documents/    # Belge üretimi
│   │   │   ├── reminders/    # Hatırlatıcılar
│   │   │   ├── ai/           # Minimax + Claude
│   │   │   ├── admin/        # Admin panel
│   │   │   ├── uets/         # UETS entegrasyonu
│   │   │   ├── uyap/         # UYAP entegrasyonu
│   │   │   ├── cron/          # Background jobs
│   │   │   ├── rag/           # Pinecone RAG
│   │   │   ├── files/         # CloudFlare R2
│   │   │   ├── payments/     # iyzico/PayTR/Stripe
│   │   │   ├── user-documents/# Özlük dosyası
│   │   │   ├── icra/          # İcra takibi
│   │   │   ├── call-center/   # Borçlu arama
│   │   │   └── calendar/      # Birleşik takvim
│   │   ├── prisma/
│   │   │   └── schema.prisma  # 23 model
│   │   └── app.module.ts
│   └── package.json
│
├── .agents/                   # Agent yönergeleri
│   ├── AGENTS.md             # Bu dosya
│   └── CLAUDE.md             # Claude özel yönergeler
│
├── AVUKATPRO_MASTER_PLAN_v3.md      # Master plan
├── IMPLEMENTATION_PLAN_v1.md       # Uygulama planı
└── SYSTEM_SCHEMA.md                 # Teknik şema
```

---

## 3. Kod Yapı Kuralları

### 3.1 Dosya Adlandırma

| Tür | Kural | Örnek |
|-----|-------|-------|
| Module | kebab-case | `user-documents.module.ts` |
| Service | kebab-case | `user-documents.service.ts` |
| Controller | kebab-case | `user-documents.controller.ts` |
| Entity/Model | PascalCase | `UserDocument` |
| Enum | PascalCase | `NotificationType` |

### 3.2 Türkçe Yorumlar

**HER SATIR** Türkçe yorum ile açıklanmalıdır:

```typescript
// ✓ DOĞRU
/**
 * Kullanıcı Getir
 * 
 * @param id - Kullanıcı ID'si
 */
async findOne(id: string) { ... }

// ✗ YANLIŞ
async findOne(id) { ... }
```

### 3.3 Module Yapısı

Her modül şu dosyaları içermelidir:
- `{module}.module.ts` - Modül tanımı
- `{module}.service.ts` - İş mantığı
- `{module}.controller.ts` - Endpoint'ler
- `services/` - Ek servisler (opsiyonel)

### 3.4 Service Yapısı

```typescript
@Injectable()
export class XxxService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Her method Türkçe yorum ile açıklanmalı
  async methodName(params) { ... }
}
```

---

## 4. Git Kuralları

### 4.1 Branch Yapısı
- `main` - Production branch
- Feature branch: `{type}/{description}` (örn: `feature/user-auth`)

### 4.2 Commit Mesajları

```
[tür] Açıklama

Türler: feat, fix, docs, refactor, test, chore
```

Örnek:
```
feat: Yeni kullanıcı doğrulama endpoint'i eklendi

- OTP doğrulama eklendi
- Token yenileme eklendi
```

### 4.3 Commit Etmeden Önce

1. TypeScript derleme hatası kontrolü
2. Prisma schema validasyonu
3. Test yoksa en azından manual test

---

## 5. Environment Değişkenleri

`.env.example` dosyası güncel tutulmalıdır. Yeni environment değişkenleri eklemeden önce:

1. `.env.example` güncelle
2. TypeScript interface güncelle
3. Varsayılan değer belirle

---

## 6. API Geliştirme Kuralları

### 6.1 Endpoint Yapısı

```typescript
@ApiTags('Kullanıcılar')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  // Endpoint'ler
}
```

### 6.2 DTO Kullanımı

- Request body için DTO class'ları kullan
- Validasyon için class-validator
- Swagger için ApiProperty decorator'ları

### 6.3 Hata Yönetimi

```typescript
// Özel exception'lar
throw new NotFoundException('Kayıt bulunamadı');
throw new BadRequestException('Geçersiz parametre');
throw new ForbiddenException('Erişim yetkiniz yok');
```

---

## 7. Veritabanı Kuralları

### 7.1 Prisma Schema

- Her model için açıklama yorumları
- İlişkiler açıkça belirtilmeli
- Index'ler tanımlanmalı
- Enum'lar büyük harf ile

### 7.2 Migration

```bash
npm run prisma:migrate --name=描述
```

### 7.3 Soft Delete

Tüm ana tablolarda `deletedAt` alanı olmalı:
```prisma
deletedAt DateTime? // Soft delete
```

---

## 8. Test Kuralları

### 8.1 Unit Test
- Her service method'u için test
- Mock kullanımı zorunlu

### 8.2 Test Dosya Yapısı
```
{service}.spec.ts
```

---

## 9. Yasal Kurallar

### 9.1 KVKK Uyumu
- Kişisel veriler Türkiye'de saklanır (Minimax Türkiye)
- Claude kullanımı için açık rıza gerekli
- Veri silme hakkı desteklenmeli

### 9.2 TBB Kuralları
- Tevkil ücretsiz (komisyon YOK)
- Algoritma sadece eşleştirir, sıralama YOK
- AI çıktıları için insan onayı zorunlu

---

## 10. Hata Durumları

### 10.1 Beklenen Hatalar
- 400: Bad Request (geçersiz input)
- 401: Unauthorized (giriş yok)
- 403: Forbidden (yetki yok)
- 404: Not Found (kayıt yok)
- 429: Rate Limit

### 10.2 Logging
```typescript
console.error('[Modül] Hata açıklaması:', error);
```

---

## 11. Dokümantasyon

### 11.1 README Güncelleme
Yeni modül eklenince:
1. Kurulum adımları
2. API endpoint'leri
3. Örnek kullanım

### 11.2 Master Plan Güncelleme
Yeni özellik eklenince:
1. Açıklama
2. Endpoint'ler
3. Veritabanı değişiklikleri

---

*Son güncelleme: 02 Haziran 2026*