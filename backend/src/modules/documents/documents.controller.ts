// ============================================================================
// Documents Controller (documents.controller.ts)
// ============================================================================
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async findAll(@Req() req: any, @Query('type') type?: string, @Query('caseId') caseId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.documentsService.findAll(req.user.userId, { type, caseId, page, limit });
  }

  @Post()
  async create(@Body() body: { caseId?: string; type: string; title: string; content?: string; aiModelUsed?: string }, @Req() req: any) {
    return this.documentsService.create(req.user.userId, body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentsService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.delete(id, req.user.userId);
  }
}