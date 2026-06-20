import { IsInt, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsInt()
  @Max(5)
  @Min(1)
  rating!: number;
}
