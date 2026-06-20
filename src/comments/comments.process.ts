import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export type CommentJob =
  | Job<CreateCommentDto & { userId: number }, unknown, 'create'>
  | Job<UpdateCommentDto & { id: number; userId: number }, unknown, 'update'>
  | Job<{ id: number; userId: number }, unknown, 'remove'>;

@Processor('comment', { concurrency: 8 })
export class CommentConsumer extends WorkerHost {
  constructor(private readonly commentsService: CommentsService) {
    super();
  }

  process(job: CommentJob): Promise<unknown> {
    switch (job.name) {
      case 'create': {
        const { userId, ...createCommentDto } = job.data;
        return this.commentsService.create(createCommentDto, userId);
      }
      case 'update': {
        const { id, userId, ...updateCommentDto } = job.data;
        return this.commentsService.update(id, updateCommentDto, userId);
      }
      case 'remove':
        return this.commentsService.remove(job.data.id, job.data.userId);
      default:
        return Promise.resolve(null);
    }
  }
}
