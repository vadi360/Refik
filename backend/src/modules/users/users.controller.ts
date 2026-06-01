// ============================================================================
// Users Controller (users.controller.ts)
// Açıklama: Kullanıcı endpoint'leri
// 
// Endpoint'ler:
// - GET /api/v1/users/profile - Kendi profilim
// - PUT /api/v1/users/profile - Profil güncelle
// - PUT /api/v1/users/password - Şifre değiştir
// - GET /api/v1/users/:id - Kullanıcı profili (herkes)
// - GET /api/v1/users/search - Avukat ara
// ============================================================================

import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Profil bilgilerim', description: 'Giriş yapmış kullanıcının profil bilgilerini getirir' })
  async getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Profil güncelle', description: 'Profil bilgilerini günceller' })
  async updateProfile(@Req() req: any, @Body() body: {
    name?: string;
    avatarUrl?: string;
    expertise?: string[];
    city?: string;
    district?: string;
    court?: string;
  }) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  @Put('password')
  @ApiOperation({ summary: 'Şifre değiştir', description: 'Mevcut şifreyi doğrulayarak yeni şifre belirler' })
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Avukat ara', description: 'Tevkil için avukat arar (şehir, ilçe, uzmanlık)' })
  async searchLawyers(
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('expertise') expertise?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.searchLawyers({ city, district, expertise, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kullanıcı profili', description: 'Belirli bir kullanıcının profilini getirir (herkes erişebilir)' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}