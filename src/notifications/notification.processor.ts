import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

type NotificationJob =
  | Job<CreateNotificationDto, unknown, 'create'>
  | Job<UpdateNotificationDto & { id: number }, unknown, 'update'>
  | Job<{ id: number }, unknown, 'remove'>
  | Job<{ recipients: number }, unknown, 'sendNotifications'>;

type NotificationBatchJob = Job<
  { userIds: number[]; data: string },
  unknown,
  'send'
>;

@Processor('notification', { concurrency: 8 })
export class NotificationConsumer extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: NotificationJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.notificationsService.create(job.data);
      case 'update':
        return this.notificationsService.update(job.data.id, job.data);
      case 'remove':
        return this.notificationsService.remove(job.data.id);
      case 'sendNotifications':
        return { processed: true, recipients: job.data.recipients };
      default:
        return null;
    }
  }
}

@Processor('steps', { concurrency: 8 })
export class StepsConsumer extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: NotificationBatchJob): Promise<unknown> {
    if (job.name !== 'send') {
      return null;
    }

    for (const userId of job.data.userIds) {
      await this.notificationsService.create({
        userId,
        data: job.data.data,
      });
    }

    return {
      processed: true,
      recipients: job.data.userIds.length,
    };
  }
}
