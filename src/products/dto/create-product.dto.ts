import {
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsInt()
  @IsPositive()
  count!: number;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  @MaxLength(100)
  photo!: string;

  @IsString()
  @MaxLength(1000)
  details!: string;
}
