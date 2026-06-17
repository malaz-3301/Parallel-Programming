import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class UpdateCartDto {
    @IsInt()
    @IsPositive()
    confirmId?: number;
    @IsNumber()
    @IsPositive()
    price?: number;
}
