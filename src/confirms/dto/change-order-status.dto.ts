import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/enums/enums';

export class ChangeOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
