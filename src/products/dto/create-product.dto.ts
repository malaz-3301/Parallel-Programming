import { IsInt, IsNumber, IsPositive, IsString, IsUrl, MaxLength, } from 'class-validator'
import { title } from 'process';
import { Company } from 'src/companies/entities/company.entity';
export class CreateProductDto {
    @IsInt()
    @IsPositive()
    count!: number;
    @IsNumber()
    @IsPositive()
    price!: number;
    @IsString()
    @MaxLength(100)
    photo!: string
    @IsString()
    @MaxLength(1000)
    details!: string
}
