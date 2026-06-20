import { Cart } from 'src/carts/entities/cart.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UserType } from 'src/enums/enums';
import { Notification } from 'src/notifications/entities/notification.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ select: false })
  password!: string;

  @Column({ update: false, unique: true })
  phone!: string;

  @Column()
  photo!: string;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts!: Cart[];

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  userType!: UserType;
}
