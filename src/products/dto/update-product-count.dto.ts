import { PickType } from "@nestjs/mapped-types";
import { UpdateProductDto } from "./update-product.dto";
import { count } from "console";
import { IsInt, IsPositive } from "class-validator";

export class UpdateProductCountDto {
    @IsInt()
    @IsPositive()
    count!: number

}