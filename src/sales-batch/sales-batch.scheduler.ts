import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class SalesBatchScheduler {
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('sales-batch') private readonly salesBatchQueue: Queue,
  ) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Damascus' })
  async handleDailySalesBatch() {
    const instanceId = this.configService.get<string>('INSTANCE_ID') ?? 'local';

    if (instanceId !== 'api-1' && instanceId !== 'local') {
      return;
    }

    await this.salesBatchQueue.add(
      'daily-sales',
      {
        chunkSize: Number(this.configService.get<string>('SALES_BATCH_CHUNK_SIZE') ?? 500),
      },
      {
        jobId: `daily-sales-${new Date().toISOString().slice(0, 10)}`,
      },
    );
  }
}
