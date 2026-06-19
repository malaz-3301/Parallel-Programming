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
import { CreateNotificationAllUsersDto } from './dto/create-notification-all-users.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

type NotificationQueueJob =
  | CreateNotificationDto
  | (UpdateNotificationDto & { id: number })
  | { id: number };

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectQueue('notification')
    private readonly notificationQueue: Queue<NotificationQueueJob>,
  ) {}

  @Roles(UserType.ADMIN)
  @Post('sendNotificationForAllUser')
  sendNotificationForAllUser(
    @Body() createNotificationAllUsersDto: CreateNotificationAllUsersDto,
  ) {
    return this.notificationsService.sendNotificationForAllUser(
      createNotificationAllUsersDto,
    );
  }

  @Roles(UserType.ADMIN)
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const job = await this.notificationQueue.add(
      'create',
      createNotificationDto,
    );
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('my')
  findAllForUser(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.findOne(+id, user.id);
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const job = await this.notificationQueue.add('update', {
      ...updateNotificationDto,
      id: +id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    const job = await this.notificationQueue.add('remove', { id: +id });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  removeForUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.removeForUser(+id, user.id);
  }
}
