// ============================================================================
// Files Controller (files.controller.ts)
// ============================================================================
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  async getUploadUrl(@Body() body: { fileName: string; contentType: string }) {
    return this.filesService.getUploadUrl(body.fileName, body.contentType);
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    return { url: this.filesService.getFileUrl(key) };
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    return { success: await this.filesService.deleteFile(key) };
  }
}