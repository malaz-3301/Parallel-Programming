import { Cart } from "src/carts/entities/cart.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Notification } from "src/notifications/entities/notification.entity";
import { UserType } from "../utils/user-type";
export declare class User {
    id: number;
    name: string;
    password: string;
    phone: string;
    photo: string;
    comments: Comment[];
    notifications: Notification[];
    carts: Cart[];
    userType: UserType;
}
