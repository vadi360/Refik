// ============================================================================
// Health Controller (health.controller.ts)
// Açıklama: Sağlık kontrolü endpoint'leri
// ============================================================================
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Genel sağlık kontrolü', description: 'Sistemin genel durumunu kontrol eder' })
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
    ]);
  }

  @Get('db')
  @ApiOperation({ summary: 'Veritabanı sağlık kontrolü', description: 'PostgreSQL bağlantısını kontrol eder' })
  @HealthCheck()
  async checkDb() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
    ]);
  }
}