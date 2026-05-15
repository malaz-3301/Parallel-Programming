import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notificationRepository: Repository<Notification>) { }
  create(createnotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createnotificationDto);
    return this.notificationRepository.save(notification)
  }

  findAll() {
    return this.notificationRepository.find()
  }

  findOne(id: number, user_id: number) {
    return this.notificationRepository.findOne({ where: { user: { id: user_id }, id } })
  }

  async update(id: number, updatenotificationDto: UpdateNotificationDto, user_id: number) {
    const notification = await this.findOne(id, user_id)
    if (notification && !notification.readAt) {
      return this.notificationRepository.update(id, updatenotificationDto)
    }
    throw new UnauthorizedException();
  }

  remove(id: number, user_id: number) {
    return this.notificationRepository.delete({ id, user: { id: user_id } });
  }
}
