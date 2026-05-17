import { IsInt, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateNotificationAllUsersDto {
    @IsString()
    @MaxLength(1000)
    data!: string;
}
