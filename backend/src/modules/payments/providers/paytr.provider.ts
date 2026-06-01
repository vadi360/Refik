// ============================================================================
// PayTR Ödeme Sağlayıcısı (paytr.provider.ts)
// Açıklama: PayTR ödeme API entegrasyonu
// 
// Bu sağlayıcı:
// 1. PayTR API'si ile ödeme işlemlerini yönetir
// 2. PayTR'ın iframe veya link tabanlı ödeme seçeneklerini destekler
// 3. Tokenization ve refund işlemlerini gerçekleştirir
// 
// PayTR Döküman: https://docs.paytr.com/
// ============================================================================
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IPaymentProvider,
  PaymentResult,
  PaymentType,
  PackageType,
  SubscriptionPaymentRequest,
  TokenPackagePaymentRequest,
  PaymentProvider,
} from './payment-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class PaytrProvider implements IPaymentProvider {
  readonly name = PaymentProvider.PAYTR;
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly merchantSalt: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>('PAYTR_MERCHANT_ID', '');
    this.merchantKey = this.configService.get<string>('PAYTR_MERCHANT_KEY', '');
    this.merchantSalt = this.configService.get<string>('PAYTR_MERCHANT_SALT', '');
    this.baseUrl = this.configService.get<boolean>('PAYTR_TEST_MODE', true)
      ? 'https://sandbox.paytr.com'
      : 'https://www.paytr.com';
  }

  /**
   * Ödeme Oluştur
   * 
   * PayTR iframe ödeme başlatır
   */
  async createPayment(
    request: SubscriptionPaymentRequest | TokenPackagePaymentRequest,
  ): Promise<PaymentResult> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new BadRequestException('Kullanıcı bulunamadı');
      }

      // Fiyat belirle
      let price: number;
      let productName: string;

      if (request.paymentType === PaymentType.SUBSCRIPTION) {
        const packagePrices = this.getSubscriptionPrice(request.packageType, request.period);
        price = packagePrices.price;
        productName = `Refik ${request.packageType} Abonelik`;
      } else {
        price = (request as TokenPackagePaymentRequest).price;
        productName = 'Token Paketi';
      }

      // PayTR token oluştur
      const token = this.generatePaytrToken(price, productName, user);

      // PayTR iframe token'ı döndür
      return {
        success: true,
        paymentUrl: `${this.baseUrl}/odeme/${token}`,
        transactionId: token,
      };
    } catch (error) {
      console.error('[PayTR] Ödeme hatası:', error);
      return {
        success: false,
        errorMessage: error.message || 'Bilinmeyen hata',
      };
    }
  }

  /**
   * Ödeme Onayla (Callback)
   */
  async verifyPayment(callbackData: any): Promise<{ verified: boolean; transactionId: string; amount: number }> {
    try {
      // PayTR hash kontrolü
      const { merchant_oid, status, hash } = callbackData;

      if (status !== 'success') {
        return { verified: false, transactionId: merchant_oid, amount: 0 };
      }

      // Hash doğrula
      const expectedHash = this.calculatePaytrHash(merchant_oid, callbackData);
      if (hash !== expectedHash) {
        console.error('[PayTR] Hash doğrulaması başarısız');
        return { verified: false, transactionId: merchant_oid, amount: 0 };
      }

      return {
        verified: true,
        transactionId: merchant_oid,
        amount: parseFloat(callbackData.total_amount) / 100, // PayTR kuruş cinsinden
      };
    } catch (error) {
      console.error('[PayTR] Doğrulama hatası:', error);
      return { verified: false, transactionId: '', amount: 0 };
    }
  }

  /**
   * İade işlemi
   */
  async refundPayment(transactionId: string): Promise<PaymentResult> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { transactionId },
      });

      if (!payment) {
        return { success: false, errorMessage: 'Ödeme bulunamadı' };
      }

      // PayTR refund API
      const response = await this.callPaytrApi('/merchant/refund', {
        merchant_id: this.merchantId,
        merchant_oid: transactionId,
        refund_amount: payment.amount.toFixed(2),
      });

      if (response.status === 'success') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });

        return { success: true, transactionId };
      }

      return { success: false, errorMessage: response.err_msg };
    } catch (error) {
      return { success: false, errorMessage: error.message };
    }
  }

  /**
   * Ödeme durumunu sorgula
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { transactionId },
      });

      return payment?.status || 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Test modu kontrolü
   */
  isTestMode(): boolean {
    return this.configService.get<boolean>('PAYTR_TEST_MODE', true);
  }

  /**
   * PayTR token oluştur
   */
  private generatePaytrToken(price: number, productName: string, user: any): string {
    const merchantOid = `AVP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const email = user.email;
    const paymentAmount = Math.round(price * 100); // PayTR kuruş cinsinden
    const userName = user.name;
    const userAddress = 'Adres bilgisi';
    const phone = user.phone || '5551234567';

    // Token string'i
    const tokenStr = `${this.merchantId}${merchantOid}${email}${paymentAmount}${userName}${userAddress}${phone}NONCE`;
    const tokenHash = this.calculatePaytrHash(tokenStr);

    return tokenHash;
  }

  /**
   * PayTR hash hesapla
   */
  private calculatePaytrHash(...values: string[]): string {
    const str = values.join('');
    return crypto.createHash('sha256').update(str).digest('base64');
  }

  /**
   * PayTR API çağrısı
   */
  private async callPaytrApi(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString(),
    });

    return response.json();
  }

  /**
   * Abonelik fiyatlarını getir
   */
  private getSubscriptionPrice(packageType: PackageType, period: 'monthly' | 'yearly') {
    const prices: Record<PackageType, { monthly: number; yearly: number }> = {
      [PackageType.BASIC]: { monthly: 199, yearly: 1990 },
      [PackageType.STANDARD]: { monthly: 499, yearly: 4990 },
      [PackageType.PROFESSIONAL]: { monthly: 999, yearly: 9990 },
      [PackageType.ENTERPRISE]: { monthly: 1999, yearly: 19990 },
    };

    const pkg = prices[packageType] || prices[PackageType.BASIC];
    return { price: period === 'yearly' ? pkg.yearly : pkg.monthly, period };
  }
}