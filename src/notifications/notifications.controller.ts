import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/utils/roles.decorator';
import { CreateNotificationAllUsersDto } from './dto/create-notification-all-users.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './notifications.process';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService, @InjectQueue('notification') private notificationQueue: Queue<JobType>) { }

  @Roles(['admin'])
  @Post('sendNotificationForAllUser')
  sendNotificationForAllUser(@Body() createNotificationAllUsersDto: CreateNotificationAllUsersDto,) {
    return this.notificationsService.sendNotificationForAllUser(createNotificationAllUsersDto,);
  }
  @Roles(['admin'])
  @Post()
  async create(@Body() createnotificationDto: CreateNotificationDto,) {
    // return this.notificationsService.create(createnotificationDto,);
    await this.notificationQueue.add('remove', createnotificationDto);
  }
  @Roles(['admin'])
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get()
  findAllForUser(@Request() req: { user: User }) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.notificationsService.findOne(+id, req.user.id);
  }

  @Roles(['admin'])
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatenotificationDto: UpdateNotificationDto,) {
    // return this.notificationsService.update(+id, updatenotificationDto, req.user.id);
    await this.notificationQueue.add('remove', { ...updatenotificationDto, id: +id, });
  }
  @Roles(['admin'])
  @Delete('delete/:id')
  async remove(@Param('id') id: string,) {
    // return this.notificationsService.remove(+id,);
    await this.notificationQueue.add('remove', { id: +id, });
  }

  @Delete(':id')
  removeForUser(@Param('id') id: string, @Request() req: { user: User }) {
    return this.notificationsService.removeForUser(+id, req.user.id);
  }
}
