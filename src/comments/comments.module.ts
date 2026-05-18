import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CommentConsumer } from './comments.process';

@Module({
  imports : [TypeOrmModule.forFeature([Comment]), BullModule.registerQueue({
    name: 'comment',
  }),],
  controllers: [CommentsController],
  providers: [CommentsService, CommentConsumer],
})
export class CommentsModule {}
