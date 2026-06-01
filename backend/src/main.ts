// ============================================================================
// Refik Backend - Ana Giriş Noktası (main.ts)
// Açıklama: NestJS uygulamasının başlatıldığı ana dosya
// Bu dosya uygulamanın yapılandırmasını, middleware'leri ve Swagger'ı ayarlar
// 
// Kullanım: `npm run start:dev` veya `npm run start:prod`
// Port: 3000 (varsayılan)
// 
// Swagger: http://localhost:3000/api/docs
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Bootstrap fonksiyonu - Uygulamayı başlatır
 * 
 * Bu fonksiyon:
 * 1. NestJS uygulamasını oluşturur
 * 2. CORS ayarlarını yapar (frontend'in API'ye erişmesi için)
 * 3. Global validation pipe'ı ekler (DTO validasyonu için)
 * 4. API versioning'i ayarlar (v1, v2 gibi)
 * 5. Swagger dokümantasyonunu oluşturur
 * 6. Uygulamayı belirtilen portta dinlemeye başlar
 */
async function bootstrap() {
  // ConfigService'i kullanarak environment değişkenlerine erişiyoruz
  const configService = new ConfigService();

  // NestJS uygulamasını oluşturuyoruz
  // disableCors: false = CORS aktif (frontend localhost:3001'den gelen istekleri kabul eder)
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        // Web uygulaması (localhost geliştirme)
        'http://localhost:3000',
        'http://localhost:3001',
        // Üretim domainleri
        'https://refik.com',
        'https://www.refik.com',
      ],
      credentials: true, // Cookie ve Authorization header'larının gönderilmesine izin verir
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    },
  });

  // =========================================================================
  // GLOBAL PIPE - Gelen isteklerin validasyonu
  // =========================================================================
  // Bu pipe, tüm DTO'ların otomatik olarak validasyonunu sağlar
  // class-validator ve class-transformer paketleriyle çalışır
  // 
  // whitelist: true = DTO'da tanımlı olmayan alanları otomatik olarak siler
  // forbidNonWhitelisted: true = Tanımlı olmayan alan gönderilirse hata verir
  // transform: true = Gelen verileri otomatik olarak DTO tipine dönüştürür
  // transformOptions: otomatik olarak boolean ve number dönüşümü yapar
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // =========================================================================
  // API VERSİYONLAMA
  // =========================================================================
  // URL'de versiyon belirtmeye olanak tanır
  // Örnek: /api/v1/users, /api/v1/cases
  // 
  // type: URI_PARAM = versiyon URL'de :1, :2 gibi belirtilir
  // prefix: 'api' = Tüm URL'lerin önüne /api eklenir
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // =========================================================================
  // SWAGGER DOKÜMANTASYONU
  // =========================================================================
  // Swagger, API'nin otomatik olarak dokümantasyonunu oluşturur
  // Geliştiriciler API'yi tarayıcıdan test edebilir
  // 
  // URL: http://localhost:3000/api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Refik API') // API'nin başlığı
    .setDescription(
      // API'nin açıklaması - ne işe yaradığı ve nasıl kullanılacağı
      `
Refik API - Türkiye'nin hukuk asistanı

## Genel Bilgiler
Bu API, avukatlara yönelik bir hukuk yönetim sistemi sunar.

## Kimlik Doğrulama
API'yi kullanmak için Bearer token gereklidir.
1. /auth/register veya /auth/login ile kayıt olun/giriş yapın
2. Response'daki access_token'ı alın
3. Sonraki isteklerde header'a "Authorization: Bearer <token>" ekleyin

## Rate Limiting
- Default: 100 istek/dakika
- Auth endpointleri: 10 istek/dakika

## AI Modelleri
Sistemde iki AI modeli bulunur:
- **Minimax M2.7**: Varsayılan model, hızlı ve düşük maliyetli
- **Claude (Sonnet)**: Yüksek doğruluk gerektiren görevler için

AI model seçimi admin panelinden yapılandırılır.
      `,
    )
    .setVersion('1.0') // API versiyonu
    .setContact(
      'Refik Team', // İletişim bilgileri
      'https://refik.com',
      'support@refik.com',
    )
    .addBearerAuth(
      // JWT token ile kimlik doğrulama
      {
        type: 'http', // HTTP Bearer scheme
        scheme: 'bearer',
        bearerFormat: 'JWT', // Token formatının açıklaması
        name: 'Authorization', // Header adı
        description: 'JWT token\'ı girin (Bearer token)',
        in: 'header', // Header'da gönderilecek
      },
      'access-token', // Security scheme adı
    )
    .addTag('Auth', 'Kimlik doğrulama işlemleri (kayıt, giriş, şifre)') // Etiketler
    .addTag('Users', 'Kullanıcı ve profil işlemleri')
    .addTag('Cases', 'Dava dosyası işlemleri')
    .addTag('Notifications', 'Tebligat işlemleri')
    .addTag('Delegations', 'Tevkil işlemleri')
    .addTag('Documents', 'Belge/dilekçe işlemleri')
    .addTag('AI', 'Yapay zeka işlemleri')
    .addTag('Admin', 'Yönetici işlemleri')
    .addTag('Health', 'Sistem sağlık kontrolü')
    .build();

  // DocumentBuilder ile oluşturulan config'den Swagger document oluştur
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Swagger UI'ı /api/docs path'inde aç
  // artık tarayıcıda http://localhost:3000/api/docs açılabilir
  SwaggerModule.setup('api/docs', app, document, {
    // Swagger UI ayarları
    customSiteTitle: 'Refik API Dokümantasyonu',
    customfavIcon: 'https://refik.com/favicon.ico',
    customCss: `
      /* Swagger UI özelleştirmesi */
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 36px }
    `,
    swaggerOptions: {
      //请求前调用的函数
      requestInterceptor: (request: any) => {
        // Authorization header'ını otomatik ekle (localStorage'dan token alınabilir)
        // Production'da güvenli bir yöntem kullanılmalı
        return request;
      },
      persistAuthorization: true, // Token'i sayfa yenilemede sakla
    },
  });

  // =========================================================================
  // UYGULAMAYI BAŞLAT
  // =========================================================================
  // Environment'dan port bilgisini al, yoksa 3000 kullan
  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  // Başarılı başlatma mesajı
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🚀 Refik Backend Başarıyla Başlatıldı!                  ║
  ║                                                               ║
  ║   📡 Sunucu: http://${host}:${port}                          ║
  ║   📖 Swagger: http://localhost:${port}/api/docs               ║
  ║   📚 API Base: http://localhost:${port}/api/v1               ║
  ║                                                               ║
  ║   ════════════════════════════════════════════════════════════║
  ║   Geliştirme: npm run start:dev                               ║
  ║   Üretim:     npm run start:prod                              ║
  ║   Test:       npm run test                                    ║
  ║   ════════════════════════════════════════════════════════════║
  ║                                                               ║
  ║   Yapımcı: Refik Team                                     ║
  ║   Versiyon: 1.0.0                                            ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
}

// Uygulamayı başlat
bootstrap();