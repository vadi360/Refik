// ============================================================================
// Local Stratejisi (local.strategy.ts)
// Açıklama: Email/password ile kimlik doğrulama stratejisi
// 
// Bu strateji:
// 1. Email ve password ile giriş yapılacağı zaman kullanılır
// 2. Passport'ın LocalStrategy'sini kullanır
// 3. Validate edilmiş kullanıcı bilgisini döndürür
// 
// Kullanım: Login endpoint'inde Passport'un local strategy'si olarak kullanılır
// ============================================================================

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Local Strateji - Email/Password Doğrulaması
 * 
 * Passport.js'in LocalStrategy'sini genişletir
 * Email ve password ile kimlik doğrulama yapar
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    // Local strategy alanları (usernameField ve passwordField)
    // Varsayılan olarak username ve password kullanır
    // Biz email kullandığımız için usernameField'ı email olarak ayarlıyoruz
    super({
      usernameField: 'email', // Email'i username olarak kullan
      passwordField: 'password', // Password alanı
    });
  }

  /**
   * Validate - Giriş bilgilerini doğrula
   * 
   * Bu metod:
   * 1. Email ve password'u alır
   * 2. AuthService'in validateUser metodunu çağırır
   * 3. Başarılıysa kullanıcı bilgisini döndürür
   * 
   * @param email - Kullanıcı email'i
   * @param password - Kullanıcı şifresi
   * @returns Doğrulanan kullanıcı bilgisi
   */
  async validate(email: string, password: string) {
    // AuthService'in validateUser metodunu çağır
    // Bu, email ve password'u doğrular
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    // Başarılı doğrulama - kullanıcı bilgisini döndür
    // Bu bilgi req.user'a eklenir
    return user;
  }
}