import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, PrismaService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
