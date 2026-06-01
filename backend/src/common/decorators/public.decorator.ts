// ============================================================================
// Public Decorator (public.decorator.ts)
// Açıklama: Endpoint'leri authentication'dan muaf tutmak için kullanılır
// 
// Kullanım:
// @Public() annotation'ı bir endpoint'e eklendiğinde,
// o endpoint JwtAuthGuard tarafından atlanır (token gerekmez)
// 
// Örnek:
// @Public()
// @Get('public-info')
// getPublicInfo() { ... }
// 
// Bu decorator özellikle:
// - Login/Register endpoint'leri için
// - Health check endpoint'leri için
// - Public dokümantasyon endpoint'leri için kullanılır
// ============================================================================
import { SetMetadata } from '@nestjs/common';

// Public endpoint marker - JwtAuthGuard bu anahtarı kontrol eder
export const IS_PUBLIC_KEY = 'isPublic';

// Public decorator - endpoint'i authentication'dan muaf tutar
// Parametre olarak metadata key ve değeri verilir
// isPublic: true = muaf, isPublic: false = korumalı
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);