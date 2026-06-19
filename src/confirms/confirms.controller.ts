import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/users/utils/user-type';
import { JobType } from './confirms.process';
import { ConfirmsService } from './confirms.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';

@Controller('confirms')
export class ConfirmsController {
  constructor(
    private readonly confirmsService: ConfirmsService,
    @InjectQueue('confirm') private readonly confirmQueue: Queue<JobType>,
  ) {}

  @Post()
  create(
    @Body() createConfirmDto: CreateConfirmDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.confirmsService.create(createConfirmDto, user.id);
  }

  @Roles(UserType.ADMIN)
  @Get()
  findAll() {
    return this.confirmsService.findAll();
  }

  @Roles(UserType.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.confirmsService.findOne(+id);
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConfirmDto: UpdateConfirmDto,
  ) {
    const job = await this.confirmQueue.add('update', {
      ...updateConfirmDto,
      id: +id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.confirmQueue.add('remove', {
      id: +id,
      user_id: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }
}
