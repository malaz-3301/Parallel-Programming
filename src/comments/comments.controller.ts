import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './comments.process';
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService, @InjectQueue('comment') private commentQueue: Queue<JobType>) { }
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req: { user: User }) {
    await this.commentQueue.add('create', { ...createCommentDto, user_id: req.user.id });
  }
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.commentsService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.commentsService.findOne(+id, req.user.id);
  }
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req: { user: User }) {
    await this.commentQueue.add('create', { ...updateCommentDto, user_id: req.user.id, id: +id });
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    await this.commentQueue.add('create', { id: +id, user_id: req.user.id });
  }
}
