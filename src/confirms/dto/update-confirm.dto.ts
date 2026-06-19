import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../utils/order-status';

export class UpdateConfirmDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
