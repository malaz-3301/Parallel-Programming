import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id!: number
    @Column()
    name!: string;
    @Column()
    location!: string;
    @Column()
    phone!: string;
    @OneToOne(() => User)
    @JoinColumn()
    user!: User
}
