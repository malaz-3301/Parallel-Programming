import { Cart } from 'src/carts/entities/cart.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

@Index('UQ_cart_product', ['cartId', 'productId'], { unique: true })
@Entity()
export class UserProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  productId!: number;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'integer' })
  cartId!: number;

  @ManyToOne(() => Cart, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @Column({ type: 'integer' })
  count!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: number;

  @VersionColumn()
  version!: number;
}
