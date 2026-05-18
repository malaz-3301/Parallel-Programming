import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';
import { UsersService } from 'src/users/users.service';
<<<<<<< Updated upstream

type NotificationJob =
  | Job<CreateNotificationDto, any, 'create'>
  | Job<UpdateNotificationDto & { id: number }, any, 'update'>
  | Job<{ id: number }, any, 'remove'>;

@Processor('notification', { concurrency: 8 })
=======
import { setTimeout } from 'timers/promises';
@Processor('notifications')
>>>>>>> Stashed changes
export class NotificationConsumer extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: NotificationJob): Promise<any> {
    switch (job.name) {
      case 'create':
        return this.notificationsService.create(job.data);
      case 'update':
        return this.notificationsService.update(job.data.id, job.data);
      case 'remove':
        return this.notificationsService.remove(job.data.id);
      default:
        return null;
    }
  }
}

@Processor('steps', { concurrency: 8 })
export class StepsConsumer extends WorkerHost {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== 'send') {
      return null;
    }

    for (let index = job.data.usersIds.min; index <= job.data.usersIds.max; index++) {
      const user = await this.usersService.findOne(index);

      if (user) {
        await this.notificationsService.create({ userId: user.id, data: job.data.data });
      }
    }

    return {
      processed: true,
      range: `${job.data.usersIds.min}-${job.data.usersIds.max}`,
    };
  }
}
