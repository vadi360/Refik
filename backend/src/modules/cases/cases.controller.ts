// ============================================================================
// Cases Controller (cases.controller.ts)
// Açıklama: Dava dosyası endpoint'leri
// ============================================================================
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cases')
@Controller('cases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  async findAll(@Req() req: any, @Query('status') status?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.casesService.findAll(req.user.userId, { status, page, limit });
  }

  @Post()
  async create(@Req() req: any, @Body() body: { caseNumber: string; court?: string; parties?: any; subject?: string }) {
    return this.casesService.create(req.user.userId, body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.casesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.casesService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.casesService.delete(id, req.user.userId);
  }

  @Get(':id/hearings')
  async getHearings(@Param('id') id: string, @Req() req: any) {
    return this.casesService.getHearings(id, req.user.userId);
  }

  @Post(':id/hearings')
  async addHearing(@Param('id') id: string, @Req() req: any, @Body() body: { hearingDate: Date; court?: string; notes?: string }) {
    return this.casesService.addHearing(id, req.user.userId, body);
  }
}