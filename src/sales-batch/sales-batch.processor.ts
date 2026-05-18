import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SalesBatchService } from './sales-batch.service';

type SalesBatchJobData = {
  date?: string;
  chunkSize?: number;
};

@Processor('sales-batch', { concurrency: 1 })
export class SalesBatchProcessor extends WorkerHost {
  constructor(private readonly salesBatchService: SalesBatchService) {
    super();
  }

  async process(job: Job<SalesBatchJobData, any, 'daily-sales'>) {
    if (job.name !== 'daily-sales') {
      return null;
    }

    return this.salesBatchService.runDailySalesBatch(job.data.date, job.data.chunkSize ?? 500);
  }
}
