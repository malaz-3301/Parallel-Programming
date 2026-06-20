import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { FlowChildJob, FlowProducer } from 'bullmq';
import { IsNull, Repository } from 'typeorm';
import { UserType } from 'src/enums/enums';
import { UsersService } from 'src/users/users.service';
import { CreateNotificationAllUsersDto } from './dto/create-notification-all-users.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

const NOTIFICATION_BATCH_SIZE = 100;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
    @InjectFlowProducer('sendNotificationForAllUser')
    private readonly notificationFlowProducer: FlowProducer,
  ) {}

  create(createNotificationDto: CreateNotificationDto, userId: number) {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      userId,
    });

    return this.notificationRepository.save(notification);
  }

  async sendNotificationForAllUser(
    createNotificationAllUsersDto: CreateNotificationAllUsersDto,
  ) {
    const users = await this.usersService.findIdsForNotifications();

    if (!users.length) {
      throw new NotFoundException('No notification recipients were found');
    }

    const children: FlowChildJob[] = [];
    for (let index = 0; index < users.length; index += NOTIFICATION_BATCH_SIZE) {
      children.push({
        name: 'send',
        queueName: 'steps',
        data: {
          userIds: users
            .slice(index, index + NOTIFICATION_BATCH_SIZE)
            .map((user) => user.id),
          data: createNotificationAllUsersDto.data,
        },
        opts: { failParentOnFailure: false },
      });
    }

    const flow = await this.notificationFlowProducer.add({
      name: 'sendNotifications',
      queueName: 'notification',
      data: { recipients: users.length },
      children,
    });

    return {
      status: 'queued',
      jobId: flow.job.id,
      recipients: users.length,
      batches: children.length,
    };
  }

  findAll() {
    return this.notificationRepository.find();
  }

  findAllForUser(userId: number) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findOneForAdmin(id: number) {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async findOne(id: number, userId: number, userType: UserType) {
    const isAdmin =
      userType === UserType.ADMIN || userType === UserType.SUPERADMIN;
    const notification = await this.notificationRepository.findOne({
      where: isAdmin ? { id } : { id, userId },
    });

    if (!notification) {
      throw new NotFoundException();
    }

    if (!isAdmin && !notification.readAt) {
      await this.notificationRepository.update(
        { id: notification.id, readAt: IsNull() },
        { readAt: new Date() },
      );
      notification.readAt = new Date();
    }

    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.findOneForAdmin(id);

    if (!notification) {
      throw new NotFoundException();
    }

    const result = await this.notificationRepository.update(
      id,
      updateNotificationDto,
    );

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return this.findOneForAdmin(id);
  }

  async remove(id: number, userId: number, userType: UserType) {
    const isAdmin =
      userType === UserType.ADMIN || userType === UserType.SUPERADMIN;
    const result = await this.notificationRepository.delete(
      isAdmin ? { id } : { id, userId },
    );

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return { id, deleted: true };
  }
}
