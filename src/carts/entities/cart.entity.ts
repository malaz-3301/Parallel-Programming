import { Confirm } from "src/confirms/entities/confirm.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserProduct } from "src/user-products/entities/user-product.entity";
@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;
    @ManyToOne(() => User)
    user!: User;
    @OneToMany(() => UserProduct, (userProduct) => userProduct.cart,)
    userProducts!: UserProduct[];
    @Column()
    price!: number;
    @OneToOne(() => Confirm, { onDelete: 'CASCADE' })
    @JoinColumn()
    confirm!: Confirm;
}
