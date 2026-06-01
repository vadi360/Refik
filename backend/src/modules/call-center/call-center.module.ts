// ============================================================================
// Call Center Modülü (call-center.module.ts)
// Açıklama: Borçlu arama ve takip modülü
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CallCenterController } from './call-center.controller';
import { CallCenterService } from './call-center.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    PrismaModule,
  ],
  controllers: [CallCenterController],
  providers: [CallCenterService, JwtAuthGuard],
  exports: [CallCenterService],
})
export class CallCenterModule {}