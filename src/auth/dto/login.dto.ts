import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';
import { IsMobilePhone, IsStrongPassword, MaxLength } from 'class-validator';

export class LoginDto {
    @IsStrongPassword()
    @MaxLength(100)
    password!: string
    @IsMobilePhone('ar-SY')
    @MaxLength(10)
    phone!: string
}
