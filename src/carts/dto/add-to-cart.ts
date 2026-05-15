import { IsBoolean, IsInt, IsPositive, IsString, MaxLength } from "class-validator";

export class AddToCart {
    @IsInt()
    @IsPositive()
    productId!: number
    @IsInt()
    @IsPositive()
    count!: number
}
