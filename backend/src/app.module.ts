// ============================================================================
// AvukatPro Backend - Ana Uygulama Modülü (app.module.ts)
// Açıklama: Uygulamanın ana modülü - tüm modülleri bir araya getirir
// 
// Bu modül:
// 1. ConfigModule ile environment değişkenlerini yükler
// 2. Veritabanı (PostgreSQL + Prisma) bağlantısını kurar
// 3. Tüm feature modüllerini (auth, users, cases, vs.) içe aktarır
// 4. Global middleware ve guards'ları ayarlar
// 
// Modül Yapısı:
// - ConfigModule: Environment değişkenleri
// - DatabaseModule: Prisma ORM ile PostgreSQL
// - AuthModule: Kimlik doğrulama
// - UsersModule: Kullanıcı işlemleri
// - CasesModule: Dava dosyası işlemleri
// - NotificationsModule: Tebligat işlemleri
// - DelegationsModule: Tevkil işlemleri
// - DocumentsModule: Belge işlemleri
// - RemindersModule: Hatırlatıcı işlemleri
// - AiModule: Yapay zeka işlemleri
// - AdminModule: Yönetici işlemleri
// - UetsModule: UETS entegrasyonu
// - FilesModule: Dosya yükleme/indirme
// - HealthModule: Sistem sağlık kontrolü
// ============================================================================

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CasesModule } from './modules/cases/cases.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DelegationsModule } from './modules/delegations/delegations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { UetsModule } from './modules/uets/uets.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { RagModule } from './modules/rag/rag.module';
import { UyapModule } from './modules/uyap/uyap.module';
import { CronModule } from './modules/cron/cron.module';

/**
 * Environment yapılandırma ayarları
 * Tüm environment değişkenleri için type-safe erişim sağlar
 */
interface EnvironmentVariables {
  // Uygulama ayarları
  NODE_ENV: string; // development, production, test
  PORT: string; // Uygulama portu (varsayılan: 3000)
  HOST: string; // Sunucu host'u (varsayılan: 0.0.0.0)

  // Veritabanı
  DATABASE_URL: string; // PostgreSQL connection string

  // Redis
  REDIS_URL: string; // Redis connection string

  // JWT
  JWT_SECRET: string; // JWT signing secret
  JWT_EXPIRES_IN: string; // Token süresi (örn: 1d, 7d, 30d)
  JWT_REFRESH_SECRET: string; // Refresh token secret
  JWT_REFRESH_EXPIRES_IN: string; // Refresh token süresi

  // AI API'leri
  MINIMAX_API_KEY: string; // Minimax API anahtarı
  MINIMAX_API_URL: string; // Minimax API URL'i
  CLAUDE_API_KEY: string; // Claude API anahtarı
  CLAUDE_API_URL: string; // Claude API URL'i

  // Cloud Storage (CloudFlare R2)
  R2_ACCOUNT_ID: string; // CloudFlare hesap ID
  R2_ACCESS_KEY: string; // R2 erişim anahtarı
  R2_SECRET_KEY: string; // R2 gizli anahtar
  R2_BUCKET: string; // R2 bucket adı
  R2_PUBLIC_URL: string; // R2 public URL

  // SMS (NetGSM)
  NETGSM_USER: string; // NetGSM kullanıcı adı
  NETGSM_PASS: string; // NetGSM şifresi
  NETGSM_ORGINATOR: string; // NetGSM başlık

  // Email (SendGrid)
  SENDGRID_API_KEY: string; // SendGrid API anahtarı
  SENDGRID_FROM_EMAIL: string; // Gönderen e-posta

  // Rate Limiting
  THROTTLE_TTL: string; // Rate limit penceresi (ms)
  THROTTLE_LIMIT: string; // İstek sayısı limiti
}

@Module({
  // =========================================================================
  // CONFIG MODULE
  // =========================================================================
  // Environment değişkenlerini uygulamaya yükler
  // isGlobal: true = Bu modül uygulamanın her yerinde erişilebilir
  // 
  // validate: [] = Environment değişkenlerinin validasyonu için fonksiyon
  //           Henüz implement edilmedi, ileride eklenecek
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Global modül - her yerde erişilebilir
      envFilePath: ['.env.development', '.env.production', '.env'], // Environment dosyaları (sırayla aranır)
      // validate: validateEnvironmentVariables, // TODO: Environment validasyonu eklenecek
    }),

    // =========================================================================
    // RATE LIMITING (Throttler)
    // =========================================================================
    // API'ye gelen isteklerin hızını sınırlar
    // DDoS koruması ve sunucu yükünü önlemek için kullanılır
    // 
    // ttl: 60000 = 60 saniye penceresi
    // limit: 100 = 60 saniyede max 100 istek
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Rate limit ayarları - environment'dan okunur veya varsayılan değerler
        ttl: config.get<number>('THROTTLE_TTL', 60000), // 60 saniye
        limit: config.get<number>('THROTTLE_LIMIT', 100), // 100 istek
      }),
    }),

    // =========================================================================
    // FEATURE MODULES
    // =========================================================================
    // Tüm uygulama modülleri burada import edilir
    // Her modül kendi controller ve service'lerini içerir

    // Veritabanı - Prisma ORM ile PostgreSQL bağlantısı
    // Bu modül tüm diğer modüller tarafından kullanılır (global)
    PrismaModule,

    // Sağlık kontrolü - /health endpoint'i için
    // Sistemin çalışıp çalışmadığını kontrol eder
    TerminusModule,

    // Auth modülü - Kimlik doğrulama (login, register, JWT)
    AuthModule,

    // Kullanıcı modülü - Profil, ayarlar, avukat arama
    UsersModule,

    // Dava modülü - Dosya yönetimi, duruşmalar
    CasesModule,

    // Tebligat modülü - Bildirimler, UETS entegrasyonu
    NotificationsModule,

    // Tevkil modülü - Avukatlar arası duruşma devri
    DelegationsModule,

    // Belge modülü - Dilekçe, ihtarname üretimi
    DocumentsModule,

    // Hatırlatıcı modülü - Takvim, bildirimler
    RemindersModule,

    // AI modülü - Özetleme, analiz, üretim
    AiModule,

    // Admin modülü - Yönetici paneli işlemleri
    AdminModule,

    // UETS modülü - PTT UETS entegrasyonu
    UetsModule,

    // Dosya modülü - CloudFlare R2 dosya yükleme
    FilesModule,

    // Sağlık modülü - Özel health check endpoint'leri
    HealthModule,

    // RAG modülü - Pinecone vektör veritabanı + similarity search
    RagModule,
    // UYAP modülü - UYAP entegrasyonu (Chrome eklentisi)
    UyapModule,
    // Cron modülü - Zamanlanmış görevler (5 gün kuralı, hatırlatıcı bildirimleri)
    CronModule,
  ],

  // =========================================================================
  // GLOBAL GUARDS
  // =========================================================================
  // Uygulama genelinde geçerli olan guards'lar
  // Her istek için otomatik olarak çalışırlar
  providers: [
    {
      // ThrottlerGuard - Rate limiting guard'ı
      // Tüm API endpoint'leri için otomatik olarak throttle kontrolü yapar
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware
   * 
   * Global middleware'leri burada ayarlayabiliriz
   * Şimdilik özel bir middleware yok
   */
  configure(consumer: MiddlewareConsumer) {
    // Örnek: CORS middleware veya logging middleware eklenebilir
    // consumer.apply(cors()).forRoutes('*');
  }
}