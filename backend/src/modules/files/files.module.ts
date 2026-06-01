// ============================================================================
// Files Modülü (files.module.ts)
// Açıklama: Dosya yükleme/indirme modülü (CloudFlare R2)
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.get<string>('JWT_SECRET'), signOptions: { expiresIn: '1h' } }) })],
  controllers: [FilesController],
  providers: [FilesService, JwtAuthGuard],
  exports: [FilesService],
})
export class FilesModule {}