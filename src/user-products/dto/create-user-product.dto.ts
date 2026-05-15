import { IsInt, IsPositive } from "class-validator"

export class CreateUserProductDto {
    @IsInt()
    @IsPositive()
    productId!: number
    @IsInt()
    @IsPositive()
    cartId!: number
    @IsInt()
    @IsPositive()
    count!: number
}
