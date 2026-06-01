// ============================================================================
// Ödeme Sağlayıcı Arayüzü (payment-provider.interface.ts)
// Açıklama: Tüm ödeme sağlayıcılar için ortak arayüz
// 
// Bu arayüz:
// 1. Farklı ödeme sağlayıcılarının (iyzico, PayTR, Stripe) ortak yapısını tanımlar
// 2. Polimorphic ödeme işlemlerini destekler
// 3. Admin panelden seçilen sağlayıcıya göre işlem yapar
// 
// Kullanım:
// - Admin panelden active provider seçilir (iyzico/paytr/stripe)
// - Tüm ödeme işlemleri bu arayüz üzerinden yapılır
// - Provider değiştiğinde kod değişikliği gerekmez
// ============================================================================

/**
 * Ödeme işlem tipleri
 */
export enum PaymentType {
  SUBSCRIPTION = 'subscription',     // Abonelik ödemesi
  TOKEN_PACKAGE = 'token_package',   // Token paketi satın alma
  ADDITION = 'addition',             // Ekstra token/limit
}

/**
 * Ödeme durumları
 */
export enum PaymentStatus {
  PENDING = 'pending',       // Beklemede
  COMPLETED = 'completed',   // Tamamlandı
  FAILED = 'failed',        // Başarısız
  REFUNDED = 'refunded',     // İade edildi
  CANCELLED = 'cancelled',   // İptal edildi
}

/**
 * Paket tipleri
 */
export enum PackageType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

/**
 * Ödeme sağlayıcı tipleri
 */
export enum PaymentProvider {
  IYZICO = 'iyzico',
  PAYTR = 'paytr',
  STRIPE = 'stripe',
}

/**
 * Ödeme işlemi sonucu
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;        // Sağlayıcıdaki işlem ID'si
  paymentUrl?: string;           // Ödeme sayfası URL'i (redirect için)
  errorMessage?: string;         // Hata mesajı
  errorCode?: string;            // Hata kodu
}

/**
 * Abonelik ödeme talebi
 */
export interface SubscriptionPaymentRequest {
  userId: string;
  packageType: PackageType;
  period: 'monthly' | 'yearly';
  paymentType: PaymentType.SUBSCRIPTION;
}

/**
 * Token paketi ödeme talebi
 */
export interface TokenPackagePaymentRequest {
  userId: string;
  packageName: string;          // Token paketi adı
  tokenAmount: number;          // Token miktarı
  price: number;                // Fiyat (TL)
  paymentType: PaymentType.TOKEN_PACKAGE;
}

/**
 * Ödeme sağlayıcı arayüzü
 * 
 * Tüm ödeme sağlayıcıları bu arayüzü implement etmeli
 */
export interface IPaymentProvider {
  /**
   * Sağlayıcı adı
   */
  readonly name: PaymentProvider;

  /**
   * Ödeme başlat
   * 
   * @param request - Ödeme talebi
   * @returns Ödeme sonucu (success + paymentUrl veya error)
   */
  createPayment(request: SubscriptionPaymentRequest | TokenPackagePaymentRequest): Promise<PaymentResult>;

  /**
   * Ödeme onayla (callback)
   * 
   * Ödeme sağlayıcısından gelen onay WebHook'unu işler
   * 
   * @param callbackData - Sağlayıcıdan gelen callback verisi
   * @returns Onaylama başarılı mı
   */
  verifyPayment(callbackData: any): Promise<{ verified: boolean; transactionId: string; amount: number }>;

  /**
   * İade işlemi
   * 
   * @param transactionId - İade edilecek işlem ID'si
   * @returns İade sonucu
   */
  refundPayment(transactionId: string): Promise<PaymentResult>;

  /**
   * Ödeme durumunu sorgula
   * 
   * @param transactionId - İşlem ID'si
   * @returns Ödeme durumu
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;

  /**
   * Test modu kontrolü
   * 
   * @returns Test modunda mı
   */
  isTestMode(): boolean;
}

/**
 * Ödeme yapılandırma (environment'dan gelir)
 */
export interface PaymentConfig {
  // iyzico
  iyzicoApiKey?: string;
  iyzicoSecretKey?: string;
  iyzicoBaseUrl?: string;

  // PayTR
  paytrMerchantId?: string;
  paytrMerchantKey?: string;
  paytrMerchantSalt?: string;

  // Stripe
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;

  // Ortak
  testMode: boolean;
}