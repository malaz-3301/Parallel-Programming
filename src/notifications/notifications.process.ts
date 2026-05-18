
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';
export type JobType = Job<CreateNotificationDto, any, 'create'> | Job<UpdateNotificationDto & { id: number }, any, 'update'> | Job<{ id: number } & { [key: string]: never }, any, 'remove'>
@Processor('notification', { concurrency: 64 })
export class NotificationsConsumer extends WorkerHost {
    constructor(private notificationsService: NotificationsService) { super() }
    async process(job: JobType): Promise<any> {
        switch (job.name) {
            case 'create': {
                return await this.notificationsService.create({ ...job.data },)
            }
            case 'update': {
                return await this.notificationsService.update(job.data.id, { ...job.data },)
            }
            case 'remove': {
                return await this.notificationsService.remove(job.data.id,)
            }
        }
    }
}
