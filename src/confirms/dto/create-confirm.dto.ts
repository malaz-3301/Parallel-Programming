import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateConfirmDto {
  @IsString()
  @MinLength(16)
  @MaxLength(200)
  payment_token!: string;
}
