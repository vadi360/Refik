// ============================================================================
// Health Modülü (health.module.ts)
// Açıklama: Sistem sağlık kontrolü modülü
// ============================================================================
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}