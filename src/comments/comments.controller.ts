import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.commentQueue.add('update', {
      ...updateCommentDto,
      userId: user.id,
      id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.commentQueue.add('remove', {
      id,
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }
}
