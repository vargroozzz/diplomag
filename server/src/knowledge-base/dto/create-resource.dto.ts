import { IsString, IsNotEmpty, IsArray, IsUrl, MinLength, IsMongoId } from 'class-validator';

export class CreateResourceDto {
  @IsMongoId()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsUrl()
  url: string;
} 