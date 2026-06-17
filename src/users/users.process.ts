
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export type JobType = Job<CreateUserDto, any, 'create'> | Job<UpdateUserDto & { id: number }, any, 'update'> | Job<{ id: number }, any, 'remove'>
@Processor('user', { concurrency: 64 })
export class UserConsumer extends WorkerHost {
    constructor(private usresService: UsersService) { super() }
    async process(job: JobType): Promise<any> {
        console.log(job)
        switch (job.name) {
            case 'create': {
                return await this.usresService.create({ ...job.data })
            }
            case 'update': {
                return await this.usresService.update(job.data.id, { ...job.data })
            }
            case 'remove': {
                return await this.usresService.remove(job.data.id)
            }
        }
    }
}
