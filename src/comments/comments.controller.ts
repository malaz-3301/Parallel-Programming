import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,) { }

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req: { user: User }) {
    return this.commentsService.create(createCommentDto, req.user.id);
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
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req: { user: User }) {
    return this.commentsService.update(+id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.commentsService.remove(+id, req.user.id);
  }
}
