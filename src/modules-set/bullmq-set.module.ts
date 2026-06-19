import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigSetModule } from './config-set.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigSetModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: Number(config.get<string>('REDIS_PORT') ?? 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
  ],
})
export class BullMqSetModule {}
