import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['summaryDate', 'productId'], { unique: true })
export class DailySalesSummary {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  summaryDate!: string;

  @Column()
  productId!: number;

  @Column()
  totalQuantity!: number;

  @Column()
  totalRevenue!: number;
}
