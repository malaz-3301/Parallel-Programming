import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private commentRepository: Repository<Comment>,) { }
  create(createCommentDto: CreateCommentDto, user_id: number) {
    const comment = this.commentRepository.create({ ...createCommentDto, user: { id: user_id } });
    return this.commentRepository.save(comment)
  }

  findAll() {
    return this.commentRepository.find();
  }

  findOne(id: number, user_id: number) {
    return this.commentRepository.findOne({ where: { id, user: { id: user_id } } })
  }

  update(id: number, updateCommentDto: UpdateCommentDto, user_id: number) {
    return this.commentRepository.update({ id, user: { id: user_id } }, { ...updateCommentDto });
  }

  remove(id: number, user_id: number) {
    return this.commentRepository.delete({ id, user: { id: user_id } })
  }
}
