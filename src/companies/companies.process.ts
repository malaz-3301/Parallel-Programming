
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export type JobType = Job<CreateCompanyDto & { user_id: number }, any, 'create'> | Job<UpdateCompanyDto & { id: number }, any, 'update'> | Job<{ id: number }, any, 'remove'>
@Processor('compnay', { concurrency: 64 })
export class CompnayConsumer extends WorkerHost {
    constructor(private compnaysService: CompaniesService) { super() }
    async process(job: JobType): Promise<any> {
        switch (job.name) {
            case 'create': {
                return await this.compnaysService.create({ ...job.data }, job.data.user_id)
            }
            case 'update': {
                return await this.compnaysService.update(job.data.id, { ...job.data },)
            }
            case 'remove': {
                return await this.compnaysService.remove(job.data.id,)
            }
        }
    }
}
