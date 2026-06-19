import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { FlowChildJob, FlowProducer } from 'bullmq';
import { IsNull, Repository } from 'typeorm';
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

  create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user: { id: createNotificationDto.userId },
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
    return this.notificationRepository.find({ where: { user: { id: userId } } });
  }

  findOneForAdmin(id: number) {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async findOne(id: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { user: { id: userId }, id },
    });

    if (!notification) {
      throw new NotFoundException();
    }

    if (!notification.readAt) {
      await this.notificationRepository.update(
        { id: notification.id, readAt: IsNull() },
        { readAt: new Date() },
      );
    }

    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.findOneForAdmin(id);

    if (!notification) {
      throw new NotFoundException();
    }

    if (notification.readAt) {
      throw new UnauthorizedException('A read notification cannot be edited');
    }

    return this.notificationRepository.update(id, updateNotificationDto);
  }

  removeForUser(id: number, userId: number) {
    return this.notificationRepository.delete({ id, user: { id: userId } });
  }

  remove(id: number) {
    return this.notificationRepository.delete(id);
  }
}
