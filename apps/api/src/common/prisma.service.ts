import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool | null = null;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://opspilot:opspilot_secret@localhost:5432/opspilot_db?schema=public';

    const pool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter } as any);
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL via Prisma 7 PG Adapter');
    } catch (err: any) {
      this.logger.warn(`Database connection warning: ${err.message}. Application will start and retry connections.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this.pool) {
      await this.pool.end();
    }
  }
}
