import { Module } from '@nestjs/common';
import { ConfirmsService } from './confirms.service';
import { ConfirmsController } from './confirms.controller';
import { Confirm } from './entities/confirm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Confirm]), CartsModule],
  controllers: [ConfirmsController],
  providers: [ConfirmsService],
})
export class ConfirmsModule { }
