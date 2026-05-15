import { IsEmail, IsLatLong, IsMobilePhone, IsString, MaxLength } from "class-validator";

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
    @IsString()
    @MaxLength(100)
    userId!: string
}
