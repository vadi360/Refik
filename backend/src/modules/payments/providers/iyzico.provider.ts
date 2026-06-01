// ============================================================================
// iyzico Ödeme Sağlayıcısı (iyzico.provider.ts)
// Açıklama: iyzico ödeme API entegrasyonu
// 
// Bu sağlayıcı:
// 1. iyzico API'si ile ödeme işlemlerini yönetir
// 2. Abonelik ve token paketi ödemelerini destekler
// 3. 3D Secure, ödeme linki ve refund işlemlerini gerçekleştirir
// 
// iyzico Döküman: https://dev.iyzico.com/
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
export class IyzicoProvider implements IPaymentProvider {
  readonly name = PaymentProvider.IYZICO;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('IYZICO_API_KEY', '');
    this.secretKey = this.configService.get<string>('IYZICO_SECRET_KEY', '');
    this.apiUrl = this.configService.get<string>('IYZICO_BASE_URL', 'https://api.iyzipay.com');
  }

  /**
   * Ödeme Oluştur
   * 
   * iyzico ile yeni bir ödeme başlatır
   * 3D Secure veya ödeme linki oluşturabilir
   */
  async createPayment(
    request: SubscriptionPaymentRequest | TokenPackagePaymentRequest,
  ): Promise<PaymentResult> {
    try {
      const conversationId = this.generateConversationId();
      const user = await this.prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new BadRequestException('Kullanıcı bulunamadı');
      }

      // Fiyat ve açıklama belirle
      let price: number;
      let conversationData: string;

      if (request.paymentType === PaymentType.SUBSCRIPTION) {
        const packagePrices = this.getSubscriptionPrice(request.packageType, request.period);
        price = packagePrices.price;
        conversationData = `subscription:${request.packageType}:${request.period}`;
      } else {
        price = (request as TokenPackagePaymentRequest).price;
        conversationData = `token:${(request as TokenPackagePaymentRequest).tokenAmount}`;
      }

      // iyzico payment request
      const paymentRequest = {
        locale: 'tr',
        conversationId,
        conversationData,
        price: price.toFixed(2),
        paidPrice: price.toFixed(2),
        currency: 'TRY',
        installment: '1',
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        paymentType: 'CARD',
        paymentCard: {
          cardHolderName: 'NOT_USED', // 3D Secure için boş
          cardNumber: 'NOT_USED',
          expireMonth: 'NOT_USED',
          expireYear: 'NOT_USED',
          cvc: 'NOT_USED',
          registerCard: '0',
        },
        buyer: {
          id: user.id,
          name: user.name.split(' ')[0] || user.name,
          surname: user.name.split(' ')[1] || '.',
          email: user.email,
          phone: user.phone || 'NOT_PROVIDED',
          identityNumber: '11111111111', // TC Kimlik zorunlu (test için)
          registrationAddress: 'NOT_PROVIDED',
          city: user.city || 'Istanbul',
          country: 'Turkey',
          zipCode: '34000',
        },
        shippingAddress: {
          contactName: user.name,
          city: user.city || 'Istanbul',
          country: 'Turkey',
          address: 'NOT_PROVIDED',
        },
        billingAddress: {
          contactName: user.name,
          city: user.city || 'Istanbul',
          country: 'Turkey',
          address: 'NOT_PROVIDED',
        },
        basketItems: [
          {
            id: '1',
            name: request.paymentType === PaymentType.SUBSCRIPTION
              ? `Refik ${request.packageType} Abonelik`
              : 'Token Paketi',
            category1: 'Hukuk Yazılımı',
            itemType: 'VIRTUAL',
            price: price.toFixed(2),
          },
        ],
      };

      // API'ye istek at
      const response = await this.callIyzicoApi('/payment/auth', paymentRequest);

      // Ödeme başarılı mı?
      if (response.status === 'success') {
        // 3D Secure ise paymentUrl'e yönlendir
        if (response.threeDSUrl) {
          return {
            success: true,
            transactionId: response.paymentId,
            paymentUrl: response.threeDSUrl,
          };
        }

        return {
          success: true,
          transactionId: response.paymentId,
        };
      }

      return {
        success: false,
        errorMessage: response.errorMessage || 'Ödeme başarısız',
        errorCode: response.errorCode,
      };
    } catch (error) {
      console.error('[iyzico] Ödeme hatası:', error);
      return {
        success: false,
        errorMessage: error.message || 'Bilinmeyen hata',
      };
    }
  }

  /**
   * Ödeme Onayla (Callback)
   * 
   * iyzico'dan gelen 3D Secure callback'ini işler
   */
  async verifyPayment(callbackData: any): Promise<{ verified: boolean; transactionId: string; amount: number }> {
    try {
      const { conversationId, paymentId, status } = callbackData;

      if (status === 'success') {
        // Ödeme başarılı - veritabanını güncelle
        await this.prisma.payment.updateMany({
          where: { transactionId: paymentId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        return {
          verified: true,
          transactionId: paymentId,
          amount: parseFloat(callbackData.paidPrice || '0'),
        };
      }

      return {
        verified: false,
        transactionId: paymentId || '',
        amount: 0,
      };
    } catch (error) {
      console.error('[iyzico] Doğrulama hatası:', error);
      return { verified: false, transactionId: '', amount: 0 };
    }
  }

  /**
   * İade işlemi
   */
  async refundPayment(transactionId: string): Promise<PaymentResult> {
    try {
      // Önce ödeme bilgisini al
      const payment = await this.prisma.payment.findFirst({
        where: { transactionId },
      });

      if (!payment) {
        return { success: false, errorMessage: 'Ödeme bulunamadı' };
      }

      // iyzico refund API'si
      const response = await this.callIyzicoApi('/payment/refund', {
        locale: 'tr',
        conversationId: this.generateConversationId(),
        paymentId: transactionId,
        price: payment.amount.toFixed(2),
        ip: '127.0.0.1',
      });

      if (response.status === 'success') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });

        return { success: true, transactionId };
      }

      return { success: false, errorMessage: response.errorMessage };
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
    return this.configService.get<boolean>('IYZICO_TEST_MODE', true);
  }

  /**
   * iyzico API çağrısı
   */
  private async callIyzicoApi(endpoint: string, data: any): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;
    
    // Authorization header oluştur
    const authHeader = this.createAuthorizationHeader(data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  /**
   * iyzico Authorization header oluştur
   */
  private createAuthorizationHeader(data: any): string {
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const timestamp = Date.now().toString();
    
    // API Key + SecretKey + random + timestamp
    const hashStr = `${this.apiKey}${this.secretKey}${random}${timestamp}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex');

    return `IYZWS ${this.apiKey}:${hash}:${random}:${timestamp}`;
  }

  /**
   * Benzersiz conversation ID oluştur
   */
  private generateConversationId(): string {
    return `AVP${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
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