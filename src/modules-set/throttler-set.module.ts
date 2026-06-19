import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigSetModule } from './config-set.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigSetModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: Number(config.get<string>('THROTTLE_TTL_MS') ?? 60_000),
            limit: Number(config.get<string>('THROTTLE_LIMIT') ?? 200),
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottlerSetModule {}
