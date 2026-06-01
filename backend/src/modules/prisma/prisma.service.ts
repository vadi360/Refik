// ============================================================================
// Prisma Servisi (prisma.service.ts)
// Açıklama: Prisma ORM'in NestJS servisine entegrasyonu
// 
// Bu servis:
// 1. PrismaClient'ı başlatır ve yönetir
// 2. Veritabanı bağlantısını sağlar
// 3. NestJS'in dependency injection sistemiyle çalışır
// 
// Kullanım: Constructor'a PrismaService injected edilerek kullanılır
// Örnek: constructor(private prisma: PrismaService) { }
// ============================================================================

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService - Veritabanı işlemleri için ana servis
 * 
 * NestJS'in OnModuleInit ve OnModuleDestroy lifecycle'larını implement eder
 * Böylece uygulama başladığında veritabanı bağlantısı otomatik kurulur
 * ve uygulama kapatıldığında bağlantı otomatik kapanır
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * OnModuleInit - Uygulama başlatıldığında çalışır
   * 
   * PrismaClient'ı başlatır ve veritabanı bağlantısını kurar
   * Bu sayede ilk veritabanı isteğinde bağlantı hazır olur
   */
  async onModuleInit() {
    // PrismaClient'ı connect metoduyla başlatır
    // Bu, veritabanına bağlanır ve connection pool oluşturur
    await this.$connect();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📦 Veritabanı Bağlantısı Kuruldu (Prisma Connected)');
    console.log('═══════════════════════════════════════════════════════════');
  }

  /**
   * OnModuleDestroy - Uygulama kapatıldığında çalışır
   * 
   * Veritabanı bağlantısını güvenli şekilde kapatır
   * Bu, connection pool'un temizlenmesini ve kaynakların serbest bırakılmasını sağlar
   */
  async onModuleDestroy() {
    // Tüm aktif transaction'ları kapatır ve bağlantıyı keser
    await this.$disconnect();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🔌 Veritabanı Bağlantısı Kapatıldı (Prisma Disconnected)');
    console.log('═══════════════════════════════════════════════════════════');
  }
}