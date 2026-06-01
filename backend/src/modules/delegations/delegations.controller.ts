// ============================================================================
// Delegations Controller (delegations.controller.ts)
// Açıklama: Tevkil endpoint'leri
// ============================================================================
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DelegationsService } from './delegations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Delegations')
@Controller('delegations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DelegationsController {
  constructor(private delegationsService: DelegationsService) {}

  @Get()
  async findAll(@Req() req: any, @Query('status') status?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.delegationsService.findAll(req.user.userId, { status, page, limit });
  }

  @Post()
  async create(@Body() body: { caseId?: string; hearingDate?: string; court?: string; message?: string; preferredLawyerId?: string }, @Req() req: any) {
    return this.delegationsService.create({ fromUserId: req.user.userId, ...body });
  }

  @Get('recommended')
  async getRecommended(@Req() req: any, @Query('caseId') caseId?: string) {
    return this.delegationsService.findRecommendedLawyers(req.user.userId, caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.delegationsService.findOne(id, req.user.userId);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    return this.delegationsService.approve(id, req.user.userId);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Req() req: any, @Body() body: { reason?: string }) {
    return this.delegationsService.reject(id, req.user.userId, body.reason);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: any) {
    return this.delegationsService.cancel(id, req.user.userId);
  }

  @Put(':id/complete')
  async complete(@Param('id') id: string, @Req() req: any) {
    return this.delegationsService.complete(id, req.user.userId);
  }

  @Post(':id/rate')
  async rate(@Param('id') id: string, @Body() body: { rating: number; comment?: string }, @Req() req: any) {
    return this.delegationsService.rate(id, req.user.userId, body.rating, body.comment);
  }

  @Post(':id/complaint')
  async createComplaint(@Param('id') id: string, @Body() body: { reason: string; description: string }, @Req() req: any) {
    return this.delegationsService.createComplaint(id, req.user.userId, body as any);
  }

  // Admin endpoint'leri
  @Get('complaints/all')
  async findComplaints(@Query('status') status?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.delegationsService.findComplaints({ status, page, limit });
  }

  @Put('complaints/:id/resolve')
  async resolveComplaint(@Param('id') id: string, @Body() body: { status: string; adminNote?: string }, @Req() req: any) {
    return this.delegationsService.resolveComplaint(id, req.user.userId, body);
  }
}