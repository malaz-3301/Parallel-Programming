import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from 'src/users/entities/user.entity';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createnotificationDto: CreateNotificationDto, req: {
        user: User;
    }): Promise<import("./entities/notification.entity").Notification>;
    findAll(user: User): Promise<import("./entities/notification.entity").Notification[]>;
    findOne(id: string, user: User): Promise<import("./entities/notification.entity").Notification | null>;
    update(id: string, updatenotificationDto: UpdateNotificationDto, user: User): Promise<import("typeorm").UpdateResult>;
    remove(id: string, user: User): Promise<import("typeorm").DeleteResult>;
}
