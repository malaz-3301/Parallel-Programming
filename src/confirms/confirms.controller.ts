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
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/enums/enums';
import { ConfirmJob } from './confirms.process';
import { ConfirmsService } from './confirms.service';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { CreateConfirmDto } from './dto/create-confirm.dto';

@Controller('confirms')
export class ConfirmsController {
  constructor(
    private readonly confirmsService: ConfirmsService,
    @InjectQueue('confirm') private readonly confirmQueue: Queue<ConfirmJob>,
  ) {}

  @Post()
  create(
    @Body() createConfirmDto: CreateConfirmDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.confirmsService.create(createConfirmDto, user.id);
  }

  @Get('my')
  findMyOrders(@CurrentUser() user: JwtPayload) {
    return this.confirmsService.findAllForUser(user.id);
  }

  @Get('my/:id')
  findMyOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.confirmsService.findOneForUser(id, user.id);
  }

  @Roles(UserType.ADMIN)
  @Get()
  findAll() {
    return this.confirmsService.findAll();
  }

  @Roles(UserType.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.confirmsService.findOne(id);
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusChange: ChangeOrderStatusDto,
  ) {
    const job = await this.confirmQueue.add('update', {
      ...statusChange,
      id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.confirmQueue.add('cancel', {
      id,
      userId: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }
}
