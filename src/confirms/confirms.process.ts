import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfirmsService } from './confirms.service';
import { UpdateConfirmDto } from './dto/update-confirm.dto';

export type JobType =
  | Job<UpdateConfirmDto & { id: number }, unknown, 'update'>
  | Job<{ id: number; user_id: number }, unknown, 'remove'>;

@Processor('confirm', { concurrency: 8 })
export class ConfirmConsumer extends WorkerHost {
  constructor(private readonly confirmsService: ConfirmsService) {
    super();
  }

  async process(job: JobType): Promise<unknown> {
    switch (job.name) {
      case 'update':
        return this.confirmsService.update(job.data.id, job.data);
      case 'remove':
        return this.confirmsService.remove(job.data.id, job.data.user_id);
      default:
        return null;
    }
  }
}
