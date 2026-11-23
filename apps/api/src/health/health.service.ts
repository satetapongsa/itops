import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async check() {
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded_or_starting';
    }

    let redisStatus = 'healthy';
    try {
      await this.redis.set('health_check', '1', 5);
      const val = await this.redis.get('health_check');
      if (val !== '1') redisStatus = 'degraded';
    } catch {
      redisStatus = 'degraded';
    }

    return {
      status: dbStatus === 'healthy' && redisStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      uptime: process.uptime(),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }
}
