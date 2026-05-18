import { Cart } from 'src/carts/entities/cart.entity';
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderStatus } from '../utils/order-status';

@Entity()
export class Confirm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  card_password!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column()
  card_number!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Cart)
  cart!: Cart;
}
