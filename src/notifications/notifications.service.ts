import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notificationRepository: Repository<Notification>, private dataSource: DataSource) { }
  create(createnotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({ ...createnotificationDto, user: { id: createnotificationDto.userId } });
    return this.notificationRepository.save(notification)
  }

  findAll() {
    return this.notificationRepository.find()
  }
  findAllForUser(user_id: number) {
    return this.notificationRepository.find({ where: { user: { id: user_id } } })
  }

  async findOne(id: number, user_id: number, entityManager: EntityManager | null = null) {
    const where = { where: { user: { id: user_id }, id } }
    if (entityManager) {
      const notification = await entityManager.findOne(Notification, where)
      await entityManager.update(Notification, {id : notification!.id, readAt: IsNull()}, { readAt: new Date() })
      return notification
    }
    const notification = await this.notificationRepository.findOne(where)
    await this.notificationRepository.update({id : notification!.id, readAt: IsNull()}, { readAt: new Date() })
    return notification
  }

  update(id: number, updatenotificationDto: UpdateNotificationDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const notification = await this.findOne(id, user_id, entityManager)
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
