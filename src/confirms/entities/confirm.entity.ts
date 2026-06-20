import { Cart } from 'src/carts/entities/cart.entity';
import { OrderStatus } from 'src/enums/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Confirm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ unique: true })
  paymentReference!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Cart, (cart) => cart.confirm)
  cart!: Cart;
}
