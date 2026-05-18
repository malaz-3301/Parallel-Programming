
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { ConfirmsService } from './confirms.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
export type JobType = Job<CreateConfirmDto & { user_id: number }, any, 'create'> | Job<UpdateConfirmDto & { id: number }, any, 'update'> | Job<{ id: number } & { user_id: number }, any, 'remove'>
@Processor('confirm', { concurrency: 64 })
export class ConfirmConsumer extends WorkerHost {
    constructor(private confirmsService: ConfirmsService) { super() }
    async process(job: JobType): Promise<any> {
        switch (job.name) {
            case 'create': {
                return await this.confirmsService.create({ ...job.data }, job.data.user_id)
            }
            case 'update': {
                return await this.confirmsService.update(job.data.id, { ...job.data },)
            }
            case 'remove': {
                return await this.confirmsService.remove(job.data.id, job.data.user_id)
            }
        }
    }
}
