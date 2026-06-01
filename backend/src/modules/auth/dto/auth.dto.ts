// ============================================================================
// Auth Data Transfer Objects (DTOs)
// Açıklama: Auth modülünde kullanılan tüm DTO'lar
// 
// DTO'lar (Data Transfer Objects):
// - API'ye gelen verilerin yapısını tanımlar
// - Validasyon kurallarını belirler (class-validator)
// - Swagger dokümantasyonunu otomatik oluşturur
// 
// Kullanım: @Body() decorator'ı ile controller'da kullanılır
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';

/**
 * Register DTO - Yeni kayıt verileri
 * 
 * Kullanıcı kaydı için gerekli bilgiler
 * - name: Ad soyad (zorunlu)
 * - email: E-posta adresi (zorunlu, benzersiz)
 * - phone: Telefon numarası (opsiyonel)
 * - password: Şifre (zorunlu, min 8 karakter)
 * - kvkkConsent: KVKK metni onayı (zorunlu)
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Ad soyad',
    example: 'Av. John Doe',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  @MaxLength(255, { message: 'Ad en fazla 255 karakter olabilir' })
  name: string;

  @ApiProperty({
    description: 'E-posta adresi',
    example: 'john@lawfirm.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({
    description: 'Telefon numarası (Türkiye formatı)',
    example: '+905321234567',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('TR', { message: 'Geçerli bir Türkiye telefon numarası giriniz (+90 ile başlayan)' })
  phone?: string;

  @ApiProperty({
    description: 'Şifre (en az 8 karakter, 1 büyük harf, 1 rakam)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @MaxLength(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Şifre en az 1 büyük harf ve 1 rakam içermelidir',
  })
  password: string;

  @ApiProperty({
    description: 'KVKK metnini okudum ve kabul ediyorum',
    example: true,
  })
  @IsBoolean()
  @Matches(true, { message: 'KVKK metnini kabul etmeniz gerekmektedir' })
  kvkkConsent: boolean;
}

/**
 * Login DTO - Giriş verileri
 * 
 * Kullanıcı girişi için gerekli bilgiler
 * - email: E-posta adresi (zorunlu)
 * - password: Şifre (zorunlu)
 */
export class LoginDto {
  @ApiProperty({
    description: 'E-posta adresi',
    example: 'john@lawfirm.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({
    description: 'Şifre',
    example: 'SecurePass123!',
  })
  @IsString()
  @MinLength(1, { message: 'Şifre giriniz' })
  password: string;
}

/**
 * Forgot Password DTO - Şifre unuttum verileri
 * 
 * Şifre sıfırlama isteği için
 * - email: E-posta adresi (zorunlu)
 */
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Kayıtlı e-posta adresi',
    example: 'john@lawfirm.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;
}

/**
 * Verify OTP DTO - OTP doğrulama verileri
 * 
 * Telefon OTP doğrulaması için
 * - phone: Telefon numarası (zorunlu)
 * - otp: 6 haneli OTP kodu (zorunlu)
 */
export class VerifyOtpDto {
  @ApiProperty({
    description: 'Telefon numarası (Türkiye formatı)',
    example: '+905321234567',
  })
  @IsPhoneNumber('TR', { message: 'Geçerli bir Türkiye telefon numarası giriniz' })
  phone: string;

  @ApiProperty({
    description: '6 haneli OTP kodu',
    example: '123456',
    pattern: '^[0-9]{6}$',
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP 6 haneli rakam olmalıdır' })
  otp: string;
}

/**
 * Reset Password DTO - Şifre sıfırlama verileri
 * 
 * Yeni şifre belirleme için (token ile)
 * - token: Şifre sıfırlama token'ı
 * - newPassword: Yeni şifre
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Şifre sıfırlama token\'ı',
    example: 'abc123xyz...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Yeni şifre (en az 8 karakter, 1 büyük harf, 1 rakam)',
    example: 'NewSecurePass456!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @MaxLength(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Şifre en az 1 büyük harf ve 1 rakam içermelidir',
  })
  newPassword: string;
}