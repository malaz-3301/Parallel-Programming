import { Product } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Favorite {
    @PrimaryGeneratedColumn()
    id!: number;
    @ManyToOne(() => User)
    user!: User;
    @ManyToOne(() => Product)
    product!: Product
}
