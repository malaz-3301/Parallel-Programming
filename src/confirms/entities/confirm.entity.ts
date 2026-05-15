import { join } from "path"
import { Cart } from "src/carts/entities/cart.entity"
import { User } from "src/users/entities/user.entity"
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { OrderStatus } from "../utils/order-status"
@Entity()
export class Confirm {
    @PrimaryGeneratedColumn()
    id!: number
    @Column()
    card_password!: string
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus
    @Column()
    card_number!: string
    @OneToOne(() => Cart)
    cart!: Cart
}
