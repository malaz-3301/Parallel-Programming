import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { CommentsService } from './comments.service';
import { CommentJob } from './comments.process';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    @InjectQueue('comment') private readonly commentQueue: Queue<CommentJob>,
  ) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.commentQueue.add('create', {
      ...createCommentDto,
      user_id: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.commentsService.findOne(+id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.commentQueue.add('update', {
      ...updateCommentDto,
      user_id: user.id,
      id: +id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.commentQueue.add('remove', {
      id: +id,
      user_id: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }
}
