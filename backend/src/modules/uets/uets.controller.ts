// ============================================================================
// UETS Controller (uets.controller.ts)
// ============================================================================
import { Controller, Get, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UetsService } from './uets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('UETS')
@Controller('uets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UetsController {
  constructor(private uetsService: UetsService) {}

  @Post('connect')
  async connect(@Body() body: { username: string; password: string }, @Req() req: any) {
    return this.uetsService.connect(req.user.userId, body);
  }

  @Delete('disconnect')
  async disconnect(@Req() req: any) {
    return this.uetsService.disconnect(req.user.userId);
  }

  @Get('status')
  async getStatus(@Req() req: any) {
    return this.uetsService.getStatus(req.user.userId);
  }

  @Post('sync')
  async sync(@Req() req: any) {
    return this.uetsService.syncNotifications(req.user.userId);
  }
}