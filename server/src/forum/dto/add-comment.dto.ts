import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  content: string;
} 