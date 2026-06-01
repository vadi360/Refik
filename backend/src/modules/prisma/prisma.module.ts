// ============================================================================
// Prisma Modülü (prisma.module.ts)
// Açıklama: Prisma servisini global olarak sağlar
// 
// Bu modül:
// 1. PrismaService'i global olarak tanımlar (global: true)
// 2. Tüm modüllerin PrismaService'e erişmesini sağlar
// 3. Veritabanı işlemlerinin tek bir yerden yapılmasını garanti eder
// 
// Not: Bu modül import edildiğinde, PrismaService otomatik olarak
// diğer modüllerde kullanılabilir (dependency injection)
// ============================================================================

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - Veritabanı Erişim Modülü
 * 
 * Global bir modül olarak tanımlanmıştır.
 * Bu sayede sadece AppModule'de import edilmesi yeterlidir.
 * Diğer modüller ayrıca import etmeden PrismaService'e erişebilir.
 */
@Global()
@Module({
  // PrismaService'i providers'a ekler
  // Artık bu servis her yerde kullanılabilir
  providers: [PrismaService],
  
  // PrismaService'i exports'a ekler
  // Bu, bu modülü import eden modüllerin de PrismaService'e erişmesini sağlar
  exports: [PrismaService],
})
export class PrismaModule {}

// Not: Bu modül otomatik olarak çalışır, başka bir yere import etmeye gerek yok
// Sadece app.module.ts'de import edilmesi yeterli
// Diğer modüller doğrudan PrismaService'i inject edebilir