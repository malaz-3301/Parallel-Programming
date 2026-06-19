import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Roles } from 'src/auth/utils/roles.decorator';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { User } from 'src/users/entities/user.entity';
import { JobType } from './confirms.process';
import { ConfirmsService } from './confirms.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';

@UseGuards(RolesGuard)
@Controller('confirms')
export class ConfirmsController {
  constructor(
    private readonly confirmsService: ConfirmsService,
    @InjectQueue('confirm') private readonly confirmQueue: Queue<JobType>,
  ) {}

  @Post()
  create(@Body() createConfirmDto: CreateConfirmDto, @Request() req: { user: User }) {
    // Checkout must return the final result to the caller and must not place
    // sensitive payment input inside Redis-backed queue storage.
    return this.confirmsService.create(createConfirmDto, req.user.id);
  }

  @Roles(['admin'])
  @Get()
  findAll() {
    return this.confirmsService.findAll();
  }

  @Roles(['admin'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.confirmsService.findOne(+id);
  }

  @Roles(['admin'])
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateConfirmDto: UpdateConfirmDto) {
    const job = await this.confirmQueue.add('update', {
      ...updateConfirmDto,
      id: +id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    const job = await this.confirmQueue.add('remove', {
      id: +id,
      user_id: req.user.id,
    });

    return { status: 'queued', jobId: job.id };
  }
}
