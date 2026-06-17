import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ConfirmsService } from './confirms.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/utils/roles.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './confirms.process';
import { RolesGuard } from 'src/auth/utils/roles.guard';
@UseGuards(RolesGuard)
@Controller('confirms')
export class ConfirmsController {
  constructor(private readonly confirmsService: ConfirmsService, @InjectQueue('confirm') private confirmQueue: Queue<JobType>) { }
  @Post()
  async create(@Body() createconfirmDto: CreateConfirmDto, @Request() req: { user: User }) {
    await this.confirmQueue.add('create', { ...createconfirmDto, user_id: req.user.id });
  }
  @Roles(['admin'])
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.confirmsService.findAll();
  }
  @Roles(['admin'])
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.confirmsService.findOne(+id);
  }
  @Roles(['admin'])
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateconfirmDto: UpdateConfirmDto, @Request() req: { user: User }) {
    await this.confirmQueue.add('update', { ...updateconfirmDto, id: +id });
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    await this.confirmQueue.add('remove', { id: +id, user_id: req.user.id });
  }
}
