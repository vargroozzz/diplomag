import { IsString, IsNotEmpty, IsDate, IsNumber, IsMongoId, Min, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsMongoId()
  @IsNotEmpty()
  organizer: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  attendees?: string[];

  @IsNumber()
  @Min(1)
  maxAttendees: number;
} 