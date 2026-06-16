import { PickType, PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductCountPriceDto extends PartialType(PickType(CreateProductDto,['count','price'])) {
}