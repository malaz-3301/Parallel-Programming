import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { UserConsumer } from './users.process';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), BullModule.registerQueue({
    name: 'user',
  }),CartsModule],
  controllers: [UsersController],
  providers: [UsersService, UserConsumer],
  exports: [UsersService]
})
export class UsersModule { }
