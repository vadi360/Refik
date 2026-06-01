// ============================================================================
// Call Center Controller (call-center.controller.ts)
// Açıklama: Call center endpoint'leri
// ============================================================================
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CallCenterService, CallResult } from './call-center.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Call Center')
@Controller('call-center')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallCenterController {
  constructor(private callCenterService: CallCenterService) {}

  /**
   * Arama Kaydı Oluştur
   */
  @Post('calls')
  async recordCall(
    @Body('icraFileId') icraFileId: string,
    @Body('callResult') callResult: CallResult,
    @Body('notes') notes?: string,
    @Body('paymentPromiseDate') paymentPromiseDate?: string,
    @Req() req: any,
  ) {
    return this.callCenterService.recordCall(
      req.user.userId,
      icraFileId,
      callResult,
      notes,
      paymentPromiseDate ? new Date(paymentPromiseDate) : undefined,
    );
  }

  /**
   * Arama Geçmişi
   */
  @Get('calls/:icraFileId')
  async getCallHistory(@Param('icraFileId') icraFileId: string, @Req() req: any) {
    return this.callCenterService.getCallHistory(icraFileId, req.user.userId);
  }

  /**
   * Bekleyen Ödeme Sözleri
   */
  @Get('promises')
  async getPendingPromises(@Req() req: any) {
    return this.callCenterService.getPendingPromises(req.user.userId);
  }

  /**
   * Ödeme Sözü Tutuldu İşaretle
   */
  @Put('promises/:callRecordId/kept')
  async markPromiseKept(
    @Param('callRecordId') callRecordId: string,
    @Req() req: any,
  ) {
    await this.callCenterService.markPromiseKept(callRecordId, req.user.userId);
    return { success: true, message: 'Ödeme sözü tutuldu olarak işaretlendi' };
  }

  /**
   * Arama Listesi (Öncelik Sırasına Göre)
   */
  @Get('call-list')
  async getCallList(@Req() req: any) {
    return this.callCenterService.getCallList(req.user.userId);
  }

  /**
   * Operatör Performans Raporu
   */
  @Get('performance')
  async getOperatorPerformance(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.callCenterService.getOperatorPerformance(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}