import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfirmsService } from './confirms.service';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

export type ConfirmJob =
  | Job<ChangeOrderStatusDto & { id: number }, unknown, 'update'>
  | Job<{ id: number; userId: number }, unknown, 'cancel'>;

@Processor('confirm', { concurrency: 8 })
export class ConfirmConsumer extends WorkerHost {
  constructor(private readonly confirmsService: ConfirmsService) {
    super();
  }

  process(job: ConfirmJob): Promise<unknown> {
    switch (job.name) {
      case 'update': {
        const { id, ...statusChange } = job.data;
        return this.confirmsService.update(id, statusChange);
      }
      case 'cancel':
        return this.confirmsService.cancelPendingOrder(
          job.data.id,
          job.data.userId,
        );
      default:
        return Promise.resolve(null);
    }
  }
}
