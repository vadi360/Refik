// ============================================================================
// JWT Auth Guard (jwt-auth.guard.ts)
// Açıklama: JWT token ile korunan endpoint'leri yönetir
// 
// Bu guard:
// 1. İstekteki JWT token'ı kontrol eder
// 2. Token geçerliyse isteğe devam eder
// 3. Token geçersizse veya yoksa 401 Unauthorized döner
// 4. @Public() decorator'ı ile işaretlenen endpoint'leri atlar
// 
// Kullanım: @UseGuards(JwtAuthGuard) ile endpoint korunur
// Örnek: @UseGuards(JwtAuthGuard) @Get('profile') ...
// ============================================================================

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * JWT Auth Guard
 * 
 * Passport'ın AuthGuard'unu genişletir
 * jwt.strategy.ts'deki JwtStrategy'yi kullanır
 * Token doğrulaması başarısız olursa 401 döner
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate - İsteğin devam edip edemeyeceğini kontrol eder
   * 
   * Bu metod:
   * 1. İsteğin geçerli bir JWT token içerip içermediğini kontrol eder
   * 2. Public endpoint'leri (login, register gibi) atlar
   * 3. Diğer tüm endpoint'ler için token zorunlu kılar
   * 
   * @param context - Execution context (request, response, vs)
   * @returns İstek devam edebilir mi (true/false) veya Observable
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // İsteğin handler'ından public metadata'yı al
    // @Public() decorator'ı ile işaretlenen endpoint'ler atlanır
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(), // Method seviyesindeki decorator
      context.getClass(), // Class seviyesindeki decorator
    ]);

    // Public endpoint'ler için guard'ı atla (token kontrolü yapma)
    if (isPublic) {
      return true;
    }

    // Diğer tüm endpoint'ler için JWT kontrolü yap
    return super.canActivate(context);
  }

  /**
   * handleRequest - Hata yakalama ve özelleştirme
   * 
   * Token doğrulaması sırasında oluşan hataları yakalar
   * ve uygun NestJS exception'ları fırlatır
   * 
   * @param err - Doğrulama hatası (varsa)
   * @param user - Doğrulanan kullanıcı (varsa)
   * @param info - Hata bilgisi (varsa)
   */
  handleRequest(err: any, user: any, info: any) {
    // Hata varsa veya kullanıcı yoksa exception fırlat
    if (err || !user) {
      // Farklı hata durumları için farklı mesajlar
      if (info?.name === 'TokenExpiredError') {
        throw err || new UnauthorizedException('Token süresi dolmuş. Lütfen tekrar giriş yapın.');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw err || new UnauthorizedException('Geçersiz token. Lütfen tekrar giriş yapın.');
      }
      // Token yok veya geçersiz
      throw err || new UnauthorizedException('Kimlik doğrulaması gerekli. Lütfen giriş yapın.');
    }
    
    // Başarılı doğrulama - kullanıcı bilgisini döndür
    return user;
  }
}

// =============================================================================
// Express Request Interface Genişletmesi
// Açıklama: req.user tipini tanımlar
// 
// Bu sayede controller'larda req.user dediğimizde TypeScript
// otomatik olarak userId ve email bilgisini tanır
// =============================================================================
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
      };
    }
  }
}