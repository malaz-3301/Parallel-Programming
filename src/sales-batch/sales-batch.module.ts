import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySalesSummary } from './entities/daily-sales-summary.entity';
import { SalesBatchProcessor } from './sales-batch.processor';
import { SalesBatchScheduler } from './sales-batch.scheduler';
import { SalesBatchService } from './sales-batch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailySalesSummary]),
    BullModule.registerQueue({
      name: 'sales-batch',
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    }),
  ],
  providers: [SalesBatchService, SalesBatchScheduler, SalesBatchProcessor],
  exports: [SalesBatchService],
})
export class SalesBatchModule {}
