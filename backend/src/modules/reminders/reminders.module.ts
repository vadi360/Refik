// ============================================================================
// Reminders Modülü
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }) })],
  controllers: [RemindersController],
  providers: [RemindersService, JwtAuthGuard],
  exports: [RemindersService],
})
export class RemindersModule {}