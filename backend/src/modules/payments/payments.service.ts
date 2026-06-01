// ============================================================================
// Ödeme Servisi (payments.service.ts)
// Açıklama: Ödeme işlemlerinin merkezi yönetimi
// 
// Bu servis:
// 1. Admin panelden seçilen ödeme sağlayıcısını kullanır
// 2. Tüm ödeme işlemlerini tek noktadan yönetir (create, verify, refund)
// 3. Abonelik yenileme ve token paketi satın alma işlemlerini yönetir
// 4. Ödeme geçmişini tutar
// 
// Admin Panel'de Ödeme Sağlayıcısı Seçimi:
// - Admin, admin panelden iyzico/paytr/stripe arasında seçim yapar
// - Seçilen sağlayıcı ai_config tablosunda saklanır
// - Tüm ödemeler admin seçimine göre yönlendirilir
// ============================================================================
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  IPaymentProvider,
  PaymentResult,
  PaymentType,
  PackageType,
  PaymentProvider,
  SubscriptionPaymentRequest,
  TokenPackagePaymentRequest,
} from './providers/payment-provider.interface';
import { IyzicoProvider } from './providers/iyzico.provider';
import { PaytrProvider } from './providers/paytr.provider';
import { StripeProvider } from './providers/stripe.provider';

@Injectable()
export class PaymentsService {
  // Ödeme sağlayıcıları haritası
  private providers: Map<PaymentProvider, IPaymentProvider>;
  private activeProvider: PaymentProvider = PaymentProvider.IYZICO;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private iyzicoProvider: IyzicoProvider,
    private paytrProvider: PaytrProvider,
    private stripeProvider: StripeProvider,
  ) {
    // Sağlayıcıları haritala
    this.providers = new Map([
      [PaymentProvider.IYZICO, this.iyzicoProvider],
      [PaymentProvider.PAYTR, this.paytrProvider],
      [PaymentProvider.STRIPE, this.stripeProvider],
    ]);

    // Admin'den seçilen aktif sağlayıcıyı yükle
    this.loadActiveProvider();
  }

  /**
   * Aktif ödeme sağlayıcısını admin config'den yükle
   */
  private async loadActiveProvider() {
    const config = await this.prisma.aiConfig.findFirst({
      where: { taskName: 'payment_provider', isActive: true },
    });

    if (config && config.model) {
      // Admin panelden seçilen sağlayıcı
      switch (config.model) {
        case 'iyzico':
          this.activeProvider = PaymentProvider.IYZICO;
          break;
        case 'paytr':
          this.activeProvider = PaymentProvider.PAYTR;
          break;
        case 'stripe':
          this.activeProvider = PaymentProvider.STRIPE;
          break;
        default:
          this.activeProvider = PaymentProvider.IYZICO;
      }
    }
  }

  /**
   * Aktif sağlayıcıyı değiştir (Admin panelden çağrılır)
   */
  async setActiveProvider(provider: PaymentProvider): Promise<void> {
    this.activeProvider = provider;

    // Admin config'e kaydet
    await this.prisma.aiConfig.upsert({
      where: { taskName: 'payment_provider' },
      update: { model: provider },
      create: {
        taskName: 'payment_provider',
        model: provider,
        isActive: true,
      },
    });
  }

  /**
   * Aktif sağlayıcıyı getir
   */
  getActiveProvider(): PaymentProvider {
    return this.activeProvider;
  }

  /**
   * Abonelik Ödemesi Başlat
   * 
   * @param userId - Kullanıcı ID'si
   * @param packageType - Paket tipi (basic/standard/professional/enterprise)
   * @param period - Abonelik periyodu (monthly/yearly)
   */
  async createSubscriptionPayment(
    userId: string,
    packageType: PackageType,
    period: 'monthly' | 'yearly',
  ): Promise<PaymentResult> {
    // Ödeme kaydı oluştur
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: PaymentType.SUBSCRIPTION,
        status: 'PENDING',
        amount: this.getPackagePrice(packageType, period),
        provider: this.activeProvider,
        metadata: { packageType, period },
      },
    });

    try {
      // Sağlayıcıdan ödeme al
      const request: SubscriptionPaymentRequest = {
        userId,
        packageType,
        period,
        paymentType: PaymentType.SUBSCRIPTION,
      };

      const result = await this.getActiveProviderInstance().createPayment(request);

      // İşlem ID'sini güncelle
      if (result.transactionId) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { transactionId: result.transactionId },
        });
      }

      // Hata varsa kaydet
      if (!result.success) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { errorMessage: result.errorMessage },
        });
      }

      return {
        ...result,
        transactionId: payment.id, // Bizim internal ID'mizi döndür
      };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Token Paketi Satın Al
   * 
   * @param userId - Kullanıcı ID'si
   * @param packageName - Paket adı
   * @param tokenAmount - Token miktarı
   * @param price - Fiyat (TL)
   */
  async createTokenPackagePayment(
    userId: string,
    packageName: string,
    tokenAmount: number,
    price: number,
  ): Promise<PaymentResult> {
    // Ödeme kaydı oluştur
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: PaymentType.TOKEN_PACKAGE,
        status: 'PENDING',
        amount: price,
        provider: this.activeProvider,
        metadata: { packageName, tokenAmount },
      },
    });

    try {
      const request: TokenPackagePaymentRequest = {
        userId,
        packageName,
        tokenAmount,
        price,
        paymentType: PaymentType.TOKEN_PACKAGE,
      };

      const result = await this.getActiveProviderInstance().createPayment(request);

      if (result.transactionId) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { transactionId: result.transactionId },
        });
      }

      return {
        ...result,
        transactionId: payment.id,
      };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Ödeme Onayla (Callback)
   * 
   * Ödeme sağlayıcısından gelen callback'i işler
   * Başarılı ödemede abonelik aktif edilir ve token eklenir
   */
  async verifyPayment(provider: PaymentProvider, callbackData: any): Promise<boolean> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new BadRequestException('Geçersiz ödeme sağlayıcısı');
    }

    const result = await providerInstance.verifyPayment(callbackData);

    if (result.verified) {
      // Ödemeyi bul ve güncelle
      const payment = await this.prisma.payment.findFirst({
        where: { transactionId: result.transactionId },
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Abonelik veya token işlemini tamamla
        await this.completePayment(payment);

        // Kullanıcıya bildirim gönder
        const user = await this.prisma.user.findUnique({ where: { id: payment.userId } });
        if (user) {
          await this.notificationsService.sendToUser(user.id, {
            title: '✅ Ödeme Başarılı',
            body: `Refik aboneliğiniz aktifleştirildi.`,
            type: 'SYSTEM',
          });
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Ödemeyi Tamamla
   * 
   * Başarılı ödeme sonrası abonelik veya token ekleme işlemini yapar
   */
  private async completePayment(payment: any): Promise<void> {
    if (payment.type === PaymentType.SUBSCRIPTION) {
      // Abonelik aktif et
      const { packageType, period } = payment.metadata as any;
      const endDate = period === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Mevcut aktif aboneliği deaktif et
      await this.prisma.subscription.updateMany({
        where: { userId: payment.userId, isActive: true },
        data: { isActive: false },
      });

      // Yeni abonelik oluştur
      await this.prisma.subscription.create({
        data: {
          userId: payment.userId,
          packageType: packageType.toUpperCase(),
          tokenLimit: this.getTokenLimit(packageType),
          startDate: new Date(),
          endDate,
          isActive: true,
        },
      });

      // Kullanıcının abonelik durumunu güncelle
      await this.prisma.user.update({
        where: { id: payment.userId },
        data: { subscriptionStatus: 'ACTIVE' },
      });
    } else if (payment.type === PaymentType.TOKEN_PACKAGE) {
      // Token ekle
      const { tokenAmount } = payment.metadata as any;

      await this.prisma.userToken.create({
        data: {
          userId: payment.userId,
          tokenAmount,
          usedAmount: 0,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        },
      });
    }
  }

  /**
   * İade işlemi
   */
  async refundPayment(transactionId: string): Promise<PaymentResult> {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      return { success: false, errorMessage: 'Ödeme bulunamadı' };
    }

    const providerInstance = this.providers.get(payment.provider as PaymentProvider);
    if (!providerInstance) {
      return { success: false, errorMessage: 'Sağlayıcı bulunamadı' };
    }

    const result = await providerInstance.refundPayment(transactionId);

    if (result.success) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      // Abonelik/işlem iptal
      if (payment.type === PaymentType.SUBSCRIPTION) {
        await this.prisma.subscription.updateMany({
          where: { userId: payment.userId },
          data: { isActive: false },
        });
      }
    }

    return result;
  }

  /**
   * Ödeme geçmişini getir
   */
  async getPaymentHistory(userId: string): Promise<any[]> {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Tüm ödemeleri getir
   */
  async getAllPayments(filters?: {
    status?: string;
    provider?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.provider) where.provider = filters.provider;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.payment.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Ödeme istatistikleri
   */
  async getPaymentStats(): Promise<{
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allPayments, todayPayments, monthPayments] = await Promise.all([
      this.prisma.payment.findMany({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
      }),
      this.prisma.payment.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
      }),
    ]);

    return {
      totalRevenue: allPayments.reduce((sum, p) => sum + p.amount, 0),
      todayRevenue: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      monthRevenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      completedCount: allPayments.length,
      pendingCount: await this.prisma.payment.count({ where: { status: 'PENDING' } }),
      failedCount: await this.prisma.payment.count({ where: { status: 'FAILED' } }),
    };
  }

  /**
   * Aktif sağlayıcı instance'ını getir
   */
  private getActiveProviderInstance(): IPaymentProvider {
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new BadRequestException('Ödeme sağlayıcısı yapılandırılmamış');
    }
    return provider;
  }

  /**
   * Paket fiyatını getir
   */
  private getPackagePrice(packageType: PackageType, period: 'monthly' | 'yearly'): number {
    const prices: Record<PackageType, { monthly: number; yearly: number }> = {
      [PackageType.BASIC]: { monthly: 199, yearly: 1990 },
      [PackageType.STANDARD]: { monthly: 499, yearly: 4990 },
      [PackageType.PROFESSIONAL]: { monthly: 999, yearly: 9990 },
      [PackageType.ENTERPRISE]: { monthly: 1999, yearly: 19990 },
    };

    const pkg = prices[packageType] || prices[PackageType.BASIC];
    return period === 'yearly' ? pkg.yearly : pkg.monthly;
  }

  /**
   * Paket token limitini getir
   */
  private getTokenLimit(packageType: PackageType): number {
    const limits: Record<PackageType, number> = {
      [PackageType.BASIC]: 1000,
      [PackageType.STANDARD]: 3000,
      [PackageType.PROFESSIONAL]: 10000,
      [PackageType.ENTERPRISE]: 50000,
    };

    return limits[packageType] || limits[PackageType.BASIC];
  }
}