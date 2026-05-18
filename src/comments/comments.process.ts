
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsService } from './comments.service';
export type JobType = Job<CreateCommentDto & { user_id: number }, any, 'create'> | Job<UpdateCommentDto & { id: number } & { user_id: number }, any, 'update'> | Job<{ id: number } & { user_id: number }, any, 'remove'>
@Processor('comment', { concurrency: 64 })
export class CommentConsumer extends WorkerHost {
    constructor(private commentsService: CommentsService) { super() }
    async process(job: JobType): Promise<any> {
        switch (job.name) {
            case 'create': {
                return await this.commentsService.create({ ...job.data }, job.data.user_id)
            }
            case 'update': {
                return await this.commentsService.update(job.data.id, { ...job.data }, job.data.user_id)
            }
            case 'remove': {
                return await this.commentsService.remove(job.data.id, job.data.user_id)
            }
        }
    }
}
