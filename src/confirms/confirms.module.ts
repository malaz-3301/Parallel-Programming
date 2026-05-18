import { Module } from '@nestjs/common';
import { ConfirmsService } from './confirms.service';
import { ConfirmsController } from './confirms.controller';
import { Confirm } from './entities/confirm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from 'src/carts/carts.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [TypeOrmModule.forFeature([Confirm]), CartsModule, BullModule.registerQueue({
    name: 'confirm',
  }),],
  controllers: [ConfirmsController],
  providers: [ConfirmsService],
})
export class ConfirmsModule { }
