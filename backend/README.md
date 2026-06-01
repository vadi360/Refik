# AvukatPro Backend

Türkiye'nin hukuk asistanı için backend API.

## Teknolojiler

- **Framework:** NestJS 10
- **ORM:** Prisma
- **Veritabanı:** PostgreSQL
- **Kimlik Doğrulama:** JWT
- **API Dokümantasyonu:** Swagger

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle

# Veritabanı migration çalıştır
npm run prisma:migrate

# Geliştirme sunucusu başlat
npm run start:dev
```

## API Dokümantasyonu

Sunucu çalıştıktan sonra: http://localhost:3000/api/docs

## Modüller

| Modül | Açıklama |
|-------|----------|
| auth | Kimlik doğrulama (kayıt, giriş, JWT) |
| users | Kullanıcı işlemleri |
| cases | Dava dosyası işlemleri |
| notifications | Tebligat işlemleri |
| delegations | Tevkil işlemleri |
| documents | Belge işlemleri |
| reminders | Hatırlatıcı işlemleri |
| ai | Yapay zeka işlemleri |
| admin | Yönetici işlemleri |
| uets | UETS entegrasyonu |
| files | Dosya işlemleri |
| health | Sağlık kontrolü |

## AI Modelleri

Sistemde iki AI modeli desteklenir:
- **Minimax M2.7** (varsayılan) - Hızlı, düşük maliyetli
- **Claude** - Yüksek doğruluk gerektiren görevler için

AI yapılandırması admin panelden yapılır.