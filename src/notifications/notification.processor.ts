import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserType } from 'src/enums/enums';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

type NotificationJob =
  | Job<CreateNotificationDto & { userId: number }, unknown, 'create'>
  | Job<UpdateNotificationDto & { id: number }, unknown, 'update'>
  | Job<
      { id: number; actorId: number; actorType: UserType },
      unknown,
      'remove'
    >
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
        return this.notificationsService.create(
          { data: job.data.data },
          job.data.userId,
        );
      case 'update':
        return this.notificationsService.update(job.data.id, {
          data: job.data.data,
        });
      case 'remove':
        return this.notificationsService.remove(
          job.data.id,
          job.data.actorId,
          job.data.actorType,
        );
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
      await this.notificationsService.create(
        { data: job.data.data },
        userId,
      );
    }

    return {
      processed: true,
      recipients: job.data.userIds.length,
    };
  }
}
