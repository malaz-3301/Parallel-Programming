import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { FlowChildJob, FlowProducer } from 'bullmq';
import { CreateNotificationAllUsersDto } from './dto/create-notification-all-users.dto';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notificationRepository: Repository<Notification>, private dataSource: DataSource, private usersService: UsersService, @InjectFlowProducer('sendNotificationForAllUser') private notificationQueue: FlowProducer) { }
  create(createnotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({ ...createnotificationDto, user: { id: createnotificationDto.userId } });
    return this.notificationRepository.save(notification)
  }
  async sendNotificationForAllUser(createNotificationAllUsersDto: CreateNotificationAllUsersDto) {
    const users = await this.usersService.finOneForNotifications();
    if (!users) {
      throw new NotFoundException();
    }
    const children: FlowChildJob[] = []
    for (let usersCount = 1; usersCount <= users.id; usersCount += 1) {
      children.push({ name: 'send', queueName: 'steps', data: { usersIds: { min: usersCount, max: usersCount }, data: createNotificationAllUsersDto.data }, opts: { failParentOnFailure: false } })
    }

    await this.notificationQueue.add({ name: 'sendNotifications', queueName: 'notification', children })
    return
  }

  findAll() {
    return this.notificationRepository.find()
  }
  findAllForUser(user_id: number) {
    return this.notificationRepository.find({ where: { user: { id: user_id } } })
  }
  async findOneForAdmin(id: number, entityManager: EntityManager) {
    return entityManager.findOne(Notification, { where: { id }, lock: { mode: 'pessimistic_write' } })
  }
  async findOne(id: number, user_id: number, entityManager: EntityManager | null = null) {
    const where = { where: { user: { id: user_id }, id } }
    if (entityManager) {
      const notification = await entityManager.findOne(Notification, { ...where, lock: { mode: 'pessimistic_write' } })
      await entityManager.update(Notification, { id: notification!.id, readAt: IsNull() }, { readAt: new Date() })
      return notification
    }
    const notification = await this.notificationRepository.findOne(where)
    await this.notificationRepository.update({ id: notification!.id, readAt: IsNull() }, { readAt: new Date() })
    return notification
  }

  update(id: number, updatenotificationDto: UpdateNotificationDto) {
    return this.dataSource.transaction(async (entityManager) => {
      const notification = await this.findOneForAdmin(id, entityManager)
      if (notification && !notification.readAt) {
        return entityManager.update(Notification, id, updatenotificationDto)
      }
      throw new UnauthorizedException();
    })
  }

  removeForUser(id: number, user_id: number) {
    return this.notificationRepository.delete({ id, user: { id: user_id } });
  }
  remove(id: number,) {
    return this.notificationRepository.delete(id);
  }
}
