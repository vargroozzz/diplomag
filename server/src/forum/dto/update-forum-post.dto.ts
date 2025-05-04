import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateForumPostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @IsOptional()
  content?: string;
} 