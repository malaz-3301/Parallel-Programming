import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Roles } from 'src/auth/utils/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateNotificationAllUsersDto } from './dto/create-notification-all-users.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from 'src/auth/utils/roles.guard';

type NotificationQueueJob =
  | CreateNotificationDto
  | (UpdateNotificationDto & { id: number })
  | { id: number };
@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectQueue('notification') private readonly notificationQueue: Queue<NotificationQueueJob>,
  ) {}

  @Roles(['admin'])
  @Post('sendNotificationForAllUser')
  sendNotificationForAllUser(@Body() createNotificationAllUsersDto: CreateNotificationAllUsersDto) {
    return this.notificationsService.sendNotificationForAllUser(createNotificationAllUsersDto);
  }

  @Roles(['admin'])
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    await this.notificationQueue.add('create', createNotificationDto);
    return { status: 'queued' };
  }

  @Roles(['admin'])
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('my')
  findAllForUser(@Request() req: { user: User }) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.notificationsService.findOne(+id, req.user.id);
  }

  @Roles(['admin'])
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    await this.notificationQueue.add('update', { ...updateNotificationDto, id: +id });
    return { status: 'queued' };
  }

  @Roles(['admin'])
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    await this.notificationQueue.add('remove', { id: +id });
    return { status: 'queued' };
  }

  @Delete(':id')
  removeForUser(@Param('id') id: string, @Request() req: { user: User }) {
    return this.notificationsService.removeForUser(+id, req.user.id);
  }
}
