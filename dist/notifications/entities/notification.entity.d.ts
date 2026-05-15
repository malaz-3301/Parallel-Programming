import { User } from "src/users/entities/user.entity";
export declare class Notification {
    id: number;
    created_at: Date;
    data: string;
    readAt: Date;
    user: User;
}
