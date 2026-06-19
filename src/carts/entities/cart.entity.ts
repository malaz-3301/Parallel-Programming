import { Confirm } from 'src/confirms/entities/confirm.entity';
import { UserProduct } from 'src/user-products/entities/user-product.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

@Index('UQ_cart_open_user', ['userId'], {
  unique: true,
  where: '"confirmId" IS NULL',
})
@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  userId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => UserProduct, (userProduct) => userProduct.cart)
  userProducts!: UserProduct[];

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'integer', nullable: true })
  confirmId!: number | null;

  @OneToOne(() => Confirm, (confirm) => confirm.cart, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'confirmId' })
  confirm!: Confirm | null;

  @VersionColumn()
  version!: number;
}
