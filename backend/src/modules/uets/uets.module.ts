// ============================================================================
// UETS Modülü (uets.module.ts)
// Açıklama: UETS entegrasyonu modülü
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UetsController } from './uets.controller';
import { UetsService } from './uets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }) })],
  controllers: [UetsController],
  providers: [UetsService, JwtAuthGuard],
  exports: [UetsService],
})
export class UetsModule {}