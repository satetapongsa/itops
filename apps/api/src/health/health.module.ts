import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, PrismaService, RedisService],
  exports: [HealthService],
})
export class HealthModule {}
