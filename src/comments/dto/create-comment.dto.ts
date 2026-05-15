import { IsInt, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from "class-validator"

export class CreateCommentDto {
    @IsInt()
    @IsPositive()
    product_id!: number
    @IsString()
    @MaxLength(1000)
    description!: string
    @IsInt()
    @IsOptional()
    @Max(5)
    @Min(0)
    rating!: number
}
