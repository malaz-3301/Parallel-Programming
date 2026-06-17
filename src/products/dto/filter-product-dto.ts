import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterProductDto {
    @Transform(({ value }) => value ? Number(value) : undefined)
    @IsNumber()
    @IsOptional()
    minPrice?: number;
    @Transform(({ value }) => value ? Number(value) : undefined)
    @IsNumber()
    @IsOptional()
    maxPrice?: number;
    @MaxLength(100)
    @IsOptional()
    keywords?: string;
}
