import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisConnection } from 'bullmq';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly connection: RedisConnection;
  private readonly keyPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.keyPrefix = this.configService.get<string>('CACHE_PREFIX') ?? 'parallel-ecommerce';
    this.connection = new RedisConnection({
      host: this.configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: Number(this.configService.get<string>('REDIS_PORT') ?? 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      db: Number(this.configService.get<string>('REDIS_CACHE_DB') ?? 1),
    });
  }

  async onModuleInit() {
    await this.connection.client;
    this.logger.log('Redis distributed cache is ready');
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.connection.client;
    const redisKey = this.buildKey(key);
    const value = await client.get(redisKey);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      await client.del(redisKey);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (serializedValue === undefined) {
      return;
    }

    const client = await this.connection.client;
    const redisKey = this.buildKey(key);

    if (ttlSeconds > 0) {
      await client.set(redisKey, serializedValue, 'EX', ttlSeconds);
      return;
    }

    await client.set(redisKey, serializedValue);
  }

  async delete(...keys: string[]): Promise<void> {
    if (!keys.length) {
      return;
    }

    const client = await this.connection.client;
    const redisKeys = keys.map((key) => this.buildKey(key));
    const firstKey = redisKeys[0];
    const remainingKeys = redisKeys.slice(1);
    await client.del(firstKey, ...remainingKeys);
  }

  private buildKey(key: string) {
    return `${this.keyPrefix}:${key}`;
  }
}
