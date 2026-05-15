import { IsEmail, IsInt, IsLatLong, IsMobilePhone, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @MaxLength(100)
    name!: string;
    @IsLatLong()
    @MaxLength(100)
    location!: string;
    @IsMobilePhone('ar-SY')
    @MaxLength(10)
    phone!: string;
    @IsInt()
    @IsPositive()
    userId!: string
}
