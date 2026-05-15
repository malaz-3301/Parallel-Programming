import { Cart } from "src/carts/entities/cart.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Company } from "src/companies/entities/company.entity";
import { UserProduct } from "src/user-products/entities/user-product.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number
    @Column()
    count!: number;
    @Column()
    price!: number;
    @Column()
    photo!: string
    @Column()
    details!: string
    @OneToOne(() => Company)
    @JoinColumn()
    company!: Company;
    @OneToMany(() => Comment, (comment) => comment.product)
    comments!: Comment[]
    @OneToMany(() => UserProduct, (userProduct) => userProduct.product)
    carts!: UserProduct[];
    @Column()
    deletedAt!: Date
}
