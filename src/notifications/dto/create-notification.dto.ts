import { IsInt, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateNotificationDto {
    @IsString()
    @MaxLength(1000)
    data!: string;
    @IsInt()
    @IsPositive()
    userId!: number;
}
