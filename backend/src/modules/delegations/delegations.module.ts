// ============================================================================
// Delegations Modülü (delegations.module.ts)
// Açıklama: Tevkil işlemleri modülü
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { DelegationsController } from './delegations.controller';
import { DelegationsService } from './delegations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }) })],
  controllers: [DelegationsController],
  providers: [DelegationsService, JwtAuthGuard],
  exports: [DelegationsService],
})
export class DelegationsModule {}