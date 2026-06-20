import { IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MaxLength(1000)
  data!: string;
}
