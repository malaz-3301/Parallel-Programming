import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/utils/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Roles(['admin'])
  @Post()
  create(@Body() createnotificationDto: CreateNotificationDto, @Request() req: { user: User }) {
    return this.notificationsService.create(createnotificationDto,);
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
  update(@Param('id') id: string, @Body() updatenotificationDto: UpdateNotificationDto, @Request() req: { user: User }) {
    return this.notificationsService.update(+id, updatenotificationDto, req.user.id);
  }
  @Roles(['admin'])
  @Delete('delete/:id')
  remove(@Param('id') id: string,) {
    return this.notificationsService.remove(+id,);
  }

  @Delete(':id')
  removeForUser(@Param('id') id: string, @Request() req: { user: User }) {
    return this.notificationsService.removeForUser(+id, req.user.id);
  }
}
