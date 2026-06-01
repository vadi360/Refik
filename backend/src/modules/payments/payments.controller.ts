// ============================================================================
// Ödeme Controller (payments.controller.ts)
// Açıklama: Ödeme endpoint'leri
// 
// Bu controller:
// 1. Abonelik ödemesi başlatma
// 2. Token paketi satın alma
// 3. Ödeme callback handling
// 4. Admin panel için ödeme yönetimi
// ============================================================================
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PackageType, PaymentProvider } from './providers/payment-provider.interface';

@ApiTags('Ödemeler')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Abonelik Ödemesi Başlat
   * 
   * @param packageType - Paket tipi (basic/standard/professional/enterprise)
   * @param period - Abonelik periyodu (monthly/yearly)
   */
  @Post('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createSubscriptionPayment(
    @Body('packageType', new ParseEnumPipe(PackageType)) packageType: PackageType,
    @Body('period') period: 'monthly' | 'yearly',
    @Req() req: any,
  ) {
    return this.paymentsService.createSubscriptionPayment(
      req.user.userId,
      packageType,
      period,
    );
  }

  /**
   * Token Paketi Satın Al
   * 
   * @param packageName - Paket adı
   * @param tokenAmount - Token miktarı
   * @param price - Fiyat
   */
  @Post('token-package')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createTokenPackagePayment(
    @Body('packageName') packageName: string,
    @Body('tokenAmount') tokenAmount: number,
    @Body('price') price: number,
    @Req() req: any,
  ) {
    return this.paymentsService.createTokenPackagePayment(
      req.user.userId,
      packageName,
      tokenAmount,
      price,
    );
  }

  /**
   * Ödeme Callback (Webhook)
   * 
   * Ödeme sağlayıcısından gelen callback'i işler
   * Bu endpoint Auth gerektirmez (webhook doğrulaması var)
   * 
   * @param provider - Ödeme sağlayıcısı (iyzico/paytr/stripe)
   */
  @Post('callback/:provider')
  @Public()
  async handlePaymentCallback(
    @Param('provider', new ParseEnumPipe(PaymentProvider)) provider: PaymentProvider,
    @Body() callbackData: any,
  ) {
    const success = await this.paymentsService.verifyPayment(provider, callbackData);
    return { success };
  }

  /**
   * Ödeme Başarılı Sayfası (Frontend yönlendirmesi için)
   */
  @Get('success')
  @Public()
  async paymentSuccess(@Query('transactionId') transactionId: string) {
    return {
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      transactionId,
    };
  }

  /**
   * Ödeme İptal Sayfası (Frontend yönlendirmesi için)
   */
  @Get('cancel')
  @Public()
  async paymentCancel() {
    return {
      success: false,
      message: 'Ödeme iptal edildi veya başarısız oldu',
    };
  }

  /**
   * Ödeme Geçmişi
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPaymentHistory(@Req() req: any) {
    return this.paymentsService.getPaymentHistory(req.user.userId);
  }

  /**
   * Admin: Aktif Sağlayıcıyı Değiştir
   * 
   * @param provider - Yeni ödeme sağlayıcısı
   */
  @Put('provider')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async setActiveProvider(
    @Body('provider', new ParseEnumPipe(PaymentProvider)) provider: PaymentProvider,
  ) {
    await this.paymentsService.setActiveProvider(provider);
    return {
      success: true,
      message: `${provider} ödeme sağlayıcısı aktif edildi`,
      activeProvider: provider,
    };
  }

  /**
   * Admin: Aktif Sağlayıcıyı Getir
   */
  @Get('provider')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getActiveProvider() {
    return {
      activeProvider: this.paymentsService.getActiveProvider(),
    };
  }

  /**
   * Admin: Tüm Ödemeleri Getir
   */
  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllPayments(
    @Query('status') status?: string,
    @Query('provider') provider?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getAllPayments({
      status,
      provider,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * Admin: Ödeme İstatistikleri
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  /**
   * Admin: İade işlemi
   */
  @Post('refund/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async refundPayment(@Param('transactionId') transactionId: string) {
    return this.paymentsService.refundPayment(transactionId);
  }
}