import { Module } from '@nestjs/common';
import { ChangesService } from './changes.service';
import { ChangesController } from './changes.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ChangesController],
  providers: [ChangesService, PrismaService],
  exports: [ChangesService],
})
export class ChangesModule {}
