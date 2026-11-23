import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private inMemoryStore: Map<string, string> = new Map();
  private connected = false;

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT) || 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    try {
      this.client = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // don't spam reconnect if offline
      });

      this.client.connect()
        .then(() => {
          this.connected = true;
          this.logger.log(`Connected to Redis at ${host}:${port}`);
        })
        .catch((err) => {
          this.logger.warn(`Redis connection failed: ${err.message}. Using resilient memory cache fallback.`);
          this.connected = false;
        });
    } catch (err: any) {
      this.logger.warn(`Redis initialization warning: ${err.message}. Fallback active.`);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.connected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // fallback
      }
    }
    return this.inMemoryStore.get(key) || null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.connected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // fallback
      }
    }
    this.inMemoryStore.set(key, value);
  }

  async del(key: string): Promise<void> {
    if (this.connected && this.client) {
      try {
        await this.client.del(key);
      } catch {
        // fallback
      }
    }
    this.inMemoryStore.delete(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }
}
