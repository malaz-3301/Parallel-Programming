import { IsInt, IsPositive } from 'class-validator';

export class CartItemQuantityDto {
  @IsInt()
  @IsPositive()
  count!: number;
}
