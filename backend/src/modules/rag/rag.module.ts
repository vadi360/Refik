// ============================================================================
// RAG Modülü (rag.module.ts)
// Açıklama: RAG (Retrieval Augmented Generation) modülü
// 
// Bu modül:
// 1. Pinecone vektör veritabanı entegrasyonu
// 2. Embedding üretimi (Minimax)
// 3. Document chunking
// 4. Similarity search
// 5. AI context hazırlama
// ============================================================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { RagService } from './services/rag.service';
import { RagController } from './rag.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}