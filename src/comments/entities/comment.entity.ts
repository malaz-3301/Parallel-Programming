import { Product } from "src/products/entities/product.entity"
import { User } from "src/users/entities/user.entity"
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number
    @Column()
    description!: string
    @Column()
    rating!: number
    @ManyToOne(()=> User)
    @JoinColumn()
    user! : User
    @ManyToOne(()=> Product)
    @JoinColumn()
    product! : Product
}
