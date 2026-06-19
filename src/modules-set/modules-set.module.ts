import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisCacheModule } from 'src/cache/redis-cache.module';
import { BullMqSetModule } from './bullmq-set.module';
import { ConfigSetModule } from './config-set.module';
import { PostgresSetModule } from './postgres-set.module';
import { ThrottlerSetModule } from './throttler-set.module';

@Module({
  imports: [
    ConfigSetModule,
    PostgresSetModule,
    BullMqSetModule,
    ThrottlerSetModule,
    RedisCacheModule,
    ScheduleModule.forRoot(),
  ],
})
export class ModulesSetModule {}
