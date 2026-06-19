import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

export type CompanyJob =
  | Job<CreateCompanyDto & { user_id: number }, unknown, 'create'>
  | Job<UpdateCompanyDto & { id: number }, unknown, 'update'>
  | Job<{ id: number }, unknown, 'remove'>;

@Processor('company', { concurrency: 8 })
export class CompanyConsumer extends WorkerHost {
  constructor(private readonly companiesService: CompaniesService) {
    super();
  }

  process(job: CompanyJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.companiesService.create(job.data, job.data.user_id);
      case 'update':
        return this.companiesService.update(job.data.id, job.data);
      case 'remove':
        return this.companiesService.remove(job.data.id);
      default:
        return Promise.resolve(null);
    }
  }
}
