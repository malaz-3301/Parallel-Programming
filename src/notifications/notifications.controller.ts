import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  create(@Body() createnotificationDto: CreateNotificationDto, @Request() req: { user: User }) {
    return this.notificationsService.create(createnotificationDto,);
  }

  @Get()
  findAll(@Request() req :{user: User}) {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req :{user: User}) {
    return this.notificationsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatenotificationDto: UpdateNotificationDto, @Request() req :{user: User}) {
    return this.notificationsService.update(+id, updatenotificationDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req :{user: User}) {
    return this.notificationsService.remove(+id, req.user.id);
  }
}
