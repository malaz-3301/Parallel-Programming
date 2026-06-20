import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserType } from 'src/enums/enums';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

export type CompanyJob =
  | Job<CreateCompanyDto, unknown, 'create'>
  | Job<
      UpdateCompanyDto & {
        id: number;
        actorId: number;
        actorType: UserType;
      },
      unknown,
      'update'
    >
  | Job<{ id: number }, unknown, 'remove'>;

@Processor('company', { concurrency: 8 })
export class CompanyConsumer extends WorkerHost {
  constructor(private readonly companiesService: CompaniesService) {
    super();
  }

  process(job: CompanyJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.companiesService.create(job.data);
      case 'update': {
        const { id, actorId, actorType, ...changes } = job.data;
        return this.companiesService.update(id, changes, actorId, actorType);
      }
      case 'remove':
        return this.companiesService.remove(job.data.id);
      default:
        return Promise.resolve(null);
    }
  }
}
