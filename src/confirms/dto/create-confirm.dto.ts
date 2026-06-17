import { IsInt, IsPositive, IsString, MaxLength } from "class-validator"

export class CreateConfirmDto {
    @IsString()
    @MaxLength(100)
    card_password!: string
    @IsString()
    @MaxLength(100)
    card_number!: string
}
