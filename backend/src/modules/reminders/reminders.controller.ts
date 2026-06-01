// ============================================================================
// Reminders Controller (reminders.controller.ts)
// ============================================================================
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reminders')
@Controller('reminders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RemindersController {
  constructor(private remindersService: RemindersService) {}

  @Get()
  async findAll(@Req() req: any, @Query('status') status?: string, @Query('caseId') caseId?: string) {
    return this.remindersService.findAll(req.user.userId, { status, caseId });
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.remindersService.create(req.user.userId, body);
  }

  @Put(':id/complete')
  async markComplete(@Param('id') id: string, @Req() req: any) {
    return this.remindersService.markComplete(id, req.user.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.remindersService.delete(id, req.user.userId);
  }
}