import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

export type UserJob =
  | Job<CreateUserDto, unknown, 'create'>
  | Job<UpdateUserDto & { id: number }, unknown, 'update'>
  | Job<{ id: number }, unknown, 'remove'>;

@Processor('user', { concurrency: 8 })
export class UserConsumer extends WorkerHost {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  process(job: UserJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.usersService.createUser(job.data);
      case 'update':
        return this.usersService.update(job.data.id, job.data);
      case 'remove':
        return this.usersService.remove(job.data.id);
      default:
        return Promise.resolve(null);
    }
  }
}
