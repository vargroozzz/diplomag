import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  content: string;
} 