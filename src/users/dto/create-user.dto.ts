import { IsMobilePhone, IsString, IsStrongPassword, MaxLength } from "class-validator"

export class CreateUserDto {
    @MaxLength(100)
    @IsString()
    name!: string
    @IsStrongPassword()
    @MaxLength(100)
    password!: string
    @IsMobilePhone()
    @MaxLength(10)
    phone!: string
    @IsString()
    @MaxLength(100)
    photo!: string
}
