import { IsMobilePhone, IsString, IsStrongPassword, MaxLength } from "class-validator"

export class RegisterDto {
    @MaxLength(100)
    @IsString()
    name!: string
    @IsStrongPassword()
    @MaxLength(100)
    password!: string
    @IsMobilePhone('ar-SY')
    @MaxLength(10)
    phone!: string
    @IsString()
    @MaxLength(100)
    photo!: string
}
