import { IsBoolean, IsInt, IsPositive, IsString, MaxLength } from "class-validator";

export class RemoveFromCart {
    @IsInt()
    @IsPositive()
    productId!: number
}
