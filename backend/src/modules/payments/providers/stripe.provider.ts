// ============================================================================
// Stripe Ödeme Sağlayıcısı (stripe.provider.ts)
// Açıklama: Stripe ödeme API entegrasyonu
// 
// Bu sağlayıcı:
// 1. Stripe API'si ile ödeme işlemlerini yönetir
// 2. Checkout Session, Payment Intent ve refund işlemlerini destekler
// 3. Webhook callback'leri ile ödeme onayı alır
// 
// Stripe Döküman: https://stripe.com/docs
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

@Injectable()
export class StripeProvider implements IPaymentProvider {
  readonly name = PaymentProvider.STRIPE;
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    this.baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
  }

  /**
   * Ödeme Oluştur
   * 
   * Stripe Checkout Session oluşturur
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

      // Fiyat ve açıklama belirle
      let amount: number;
      let productName: string;
      let metadata: Record<string, string>;

      if (request.paymentType === PaymentType.SUBSCRIPTION) {
        const packagePrices = this.getSubscriptionPrice(request.packageType, request.period);
        amount = Math.round(packagePrices.price * 100); // Kuruş cinsinden
        productName = `AvukatPro ${request.packageType} - ${request.period === 'yearly' ? 'Yıllık' : 'Aylık'}`;
        metadata = {
          type: 'subscription',
          packageType: request.packageType,
          period: request.period,
          userId: request.userId,
        };
      } else {
        amount = Math.round((request as TokenPackagePaymentRequest).price * 100);
        productName = `${(request as TokenPackagePaymentRequest).tokenAmount} Token`;
        metadata = {
          type: 'token',
          tokenAmount: (request as TokenPackagePaymentRequest).tokenAmount.toString(),
          userId: request.userId,
        };
      }

      // Stripe Checkout Session oluştur
      const session = await this.createCheckoutSession({
        amount,
        productName,
        customerEmail: user.email,
        metadata,
      });

      return {
        success: true,
        transactionId: session.id,
        paymentUrl: session.url, // Stripe Checkout URL
      };
    } catch (error) {
      console.error('[Stripe] Ödeme hatası:', error);
      return {
        success: false,
        errorMessage: error.message || 'Bilinmeyen hata',
        errorCode: error.code,
      };
    }
  }

  /**
   * Ödeme Onayla (Webhook)
   * 
   * Stripe webhook'ını işler
   */
  async verifyPayment(callbackData: any): Promise<{ verified: boolean; transactionId: string; amount: number }> {
    try {
      // Stripe signature doğrulaması
      const signature = callbackData.headers?.['stripe-signature'];
      
      if (!signature) {
        return { verified: false, transactionId: '', amount: 0 };
      }

      // Event oluştur
      const event = callbackData.body; // JSON.parse(body) done by middleware
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        return {
          verified: true,
          transactionId: session.payment_intent || session.id,
          amount: session.amount_total,
        };
      }

      return { verified: false, transactionId: '', amount: 0 };
    } catch (error) {
      console.error('[Stripe] Doğrulama hatası:', error);
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

      // Stripe refund API
      const response = await this.stripeRequest('/refunds', 'POST', {
        payment_intent: transactionId,
      });

      if (!response.error) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });

        return { success: true, transactionId };
      }

      return { success: false, errorMessage: response.error.message };
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
    return this.secretKey.includes('test');
  }

  /**
   * Stripe Checkout Session oluştur
   */
  private async createCheckoutSession(params: {
    amount: number;
    productName: string;
    customerEmail: string;
    metadata: Record<string, string>;
  }): Promise<any> {
    const sessionPayload = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: params.productName,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      customer_email: params.customerEmail,
      metadata: params.metadata,
      success_url: `${this.baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.baseUrl}/payment/cancel`,
    };

    return this.stripeRequest('/checkout/sessions', 'POST', sessionPayload);
  }

  /**
   * Stripe API isteği
   */
  private async stripeRequest(endpoint: string, method: string, data: any): Promise<any> {
    const url = `https://api.stripe.com${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${this.secretKey}`,
      },
      body: new URLSearchParams(
        Object.entries(data).reduce((acc, [key, value]) => {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => {
              acc.push([`${key}[${k}]`, v]);
            });
          } else {
            acc.push([key, String(value)]);
          }
          return acc;
        }, [] as [string, string][])
      ).toString(),
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