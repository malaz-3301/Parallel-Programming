import { Cart } from "src/carts/entities/cart.entity";
import { Product } from "src/products/entities/product.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, VersionColumn } from "typeorm";
@Entity()
export class  UserProduct {
    @PrimaryGeneratedColumn()
    id!: number
    @ManyToOne(() => Product, )
    product!: Product
    @ManyToOne(() => Cart, { onDelete: "CASCADE" })
    cart!: Cart
    @Column()
    count!: number
    @Column()
    price!: number
    @VersionColumn()
    version!: number;
}
