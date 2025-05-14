import { IsString, IsOptional, IsInt, Min, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User biography', example: 'Passionate beekeeper since 2010.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'User location', example: 'Kyiv, Ukraine' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'User areas of expertise', example: ['Honey Production', 'Queen Rearing'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  // New beekeeping-specific fields
  @ApiPropertyOptional({ description: 'Number of hives managed', example: 10, type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  hiveCount?: number;

  @ApiPropertyOptional({ description: 'Years of beekeeping experience', example: 5, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: 'Types of bees kept', example: ['Carniolan', 'Buckfast'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beeTypes?: string[];

  @ApiPropertyOptional({ description: 'Primary local forage for bees', example: ['Acacia', 'Linden', 'Sunflower'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryForage?: string[];

  @ApiPropertyOptional({ description: 'Specific beekeeping interests', example: ['Natural Beekeeping', 'Apitherapy'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beekeepingInterests?: string[];

  @ApiPropertyOptional({ description: 'What the user is looking for from the community', example: 'Mentorship, swarm capture opportunities' })
  @IsOptional()
  @IsString()
  lookingFor?: string;

  @ApiPropertyOptional({ description: 'What the user can offer to the community', example: 'Local honey, beeswax candles, advice for beginners' })
  @IsOptional()
  @IsString()
  offering?: string;
} 