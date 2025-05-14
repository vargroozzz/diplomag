import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AskFaqDto {
  @ApiProperty({
    description: "User's question for the FAQ system",
    example: "How do I add a hive?",
  })
  @IsString()
  @IsNotEmpty()
  question: string;
} 