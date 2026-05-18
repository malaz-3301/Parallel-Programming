import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { UserConsumer } from './users.process';

@Module({
  imports: [TypeOrmModule.forFeature([User]), BullModule.registerQueue({
    name: 'user',
  }),],
  controllers: [UsersController],
  providers: [UsersService, UserConsumer],
  exports: [UsersService]
})
export class UsersModule { }
