import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from 'src/carts/carts.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserConsumer } from './users.process';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({ name: 'user' }),
    CartsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserConsumer],
  exports: [UsersService],
})
export class UsersModule {}
