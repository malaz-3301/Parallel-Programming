import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export type CommentJob =
  | Job<CreateCommentDto & { user_id: number }, unknown, 'create'>
  | Job<UpdateCommentDto & { id: number; user_id: number }, unknown, 'update'>
  | Job<{ id: number; user_id: number }, unknown, 'remove'>;

@Processor('comment', { concurrency: 8 })
export class CommentConsumer extends WorkerHost {
  constructor(private readonly commentsService: CommentsService) {
    super();
  }

  process(job: CommentJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.commentsService.create(job.data, job.data.user_id);
      case 'update':
        return this.commentsService.update(
          job.data.id,
          job.data,
          job.data.user_id,
        );
      case 'remove':
        return this.commentsService.remove(job.data.id, job.data.user_id);
      default:
        return Promise.resolve(null);
    }
  }
}
