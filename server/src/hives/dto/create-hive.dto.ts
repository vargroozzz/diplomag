import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class LocationPointDto {
  @IsString()
  @IsNotEmpty()
  readonly type: string = 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  readonly coordinates: [number, number]; // [longitude, latitude]
}

export class CreateHiveDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly notes?: string;

  @ValidateNested()
  @Type(() => LocationPointDto)
  @IsNotEmpty()
  readonly location: LocationPointDto;
} 