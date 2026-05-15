import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;
    @CreateDateColumn({ update: false })
    created_at!: Date;
    @Column()
    data!: string;
    @Column()
    readAt!: Date ;
    @ManyToOne(() => User)
    @JoinColumn()
    user!: User
}
