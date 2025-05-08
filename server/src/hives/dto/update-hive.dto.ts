import { IsString, IsOptional, ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateLocationPointDto {
  @IsString()
  @IsOptional()
  readonly type?: string = 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  readonly coordinates?: [number, number]; // [longitude, latitude]
}
export class UpdateHiveDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly notes?: string;

  @ValidateNested()
  @Type(() => UpdateLocationPointDto)
  @IsOptional()
  readonly location?: UpdateLocationPointDto;
} 