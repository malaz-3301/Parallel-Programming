import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
export declare class NotificationsService {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    create(createnotificationDto: CreateNotificationDto): Promise<Notification>;
    findAll(): Promise<Notification[]>;
    findOne(id: number, user_id: number): Promise<Notification | null>;
    update(id: number, updatenotificationDto: UpdateNotificationDto, user_id: number): Promise<import("typeorm").UpdateResult>;
    remove(id: number, user_id: number): Promise<import("typeorm").DeleteResult>;
}
