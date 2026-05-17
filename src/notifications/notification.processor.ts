
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
@Processor('notification')
export class NotificationConsumer extends WorkerHost {
    async process(job: Job<any, any, string>): Promise<any> {

        switch (job.queueName) {
            case 'notification': {
                console.log('تمت العملية بنجاح');
            }
        }
    }
}

@Processor('steps', { concurrency: 1 })
export class StepsConsumer extends WorkerHost {
    constructor(private notificationsService: NotificationsService, private usersService: UsersService) { super() }
    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'send') {
            for (let index = job.data.usersIds.min; index <= job.data.usersIds.max; index++) {
                const user = await this.usersService.findOne(index)
                if (user)
                    await this.notificationsService.create({ userId: user.id, data: job.data.data })
                await setTimeout(10000);
                console.log("123")
            }
            return {
                processed: true,
                range: `${job.data.usersIds.min}-${job.data.usersIds.max}`
            };
        }
    }
}
