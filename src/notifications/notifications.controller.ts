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
import { CreateNotificationAllUsersDto } from './dto/create-notification-all-users.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

type NotificationQueueJob =
  | (CreateNotificationDto & { userId: number })
  | (UpdateNotificationDto & { id: number })
  | { id: number; actorId: number; actorType: UserType };

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectQueue('notification')
    private readonly notificationQueue: Queue<NotificationQueueJob>,
  ) {}

  @Roles(UserType.ADMIN)
  @Post('broadcast')
  sendNotificationForAllUser(
    @Body() createNotificationAllUsersDto: CreateNotificationAllUsersDto,
  ) {
    return this.notificationsService.sendNotificationForAllUser(
      createNotificationAllUsersDto,
    );
  }

  @Roles(UserType.ADMIN)
  @Post('users/:userId')
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const job = await this.notificationQueue.add('create', {
      ...createNotificationDto,
      userId,
    });
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
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationsService.findOne(id, user.id, user.userType);
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const job = await this.notificationQueue.add('update', {
      ...updateNotificationDto,
      id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: JwtPayload,
  ) {
    const job = await this.notificationQueue.add('remove', {
      id,
      actorId: actor.id,
      actorType: actor.userType,
    });
    return { status: 'queued', jobId: job.id };
  }
}
