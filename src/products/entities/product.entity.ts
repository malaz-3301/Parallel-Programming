import { Comment } from 'src/comments/entities/comment.entity';
import { Company } from 'src/companies/entities/company.entity';
import { UserProduct } from 'src/user-products/entities/user-product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  count!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: number;

  @Column()
  photo!: string;

  @Column()
  details!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;

  @OneToMany(() => Comment, (comment) => comment.product)
  comments!: Comment[];

  @OneToMany(() => UserProduct, (userProduct) => userProduct.product)
  userProducts!: UserProduct[];

  @Column({ nullable: true })
  deletedAt!: Date | null;
}
