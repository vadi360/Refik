// ============================================================================
// Admin Controller (admin.controller.ts)
// Açıklama: Admin endpoint'leri
// ============================================================================
import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string, @Query('status') status?: string) {
    return this.adminService.getAllUsers({ page, limit, search, status });
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('ai-config')
  async getAiConfig() {
    return this.adminService.getAiConfig();
  }

  @Put('ai-config/:task')
  async updateAiConfig(@Param('task') task: string, @Body() body: { model: string }, @Req() req: any) {
    return this.adminService.updateAiConfig(task, body.model, req.user.userId);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Post('broadcast')
  async broadcast(@Body() body: { title: string; content: string; userIds?: string[] }) {
    return this.adminService.broadcastNotification(body.title, body.content, body.userIds);
  }
}