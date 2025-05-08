import { IsString, IsOptional, ValidateNested, IsArray, ArrayMinSize, IsDateString, ArrayNotEmpty, ArrayMaxSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Represents a single point { lng, lat } (Optional)
class UpdatePointDto {
  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsNumber()
  @IsOptional()
  lat?: number;
}

// Represents a LinearRing (array of points) (Optional)
class UpdateLinearRingDto {
  @ValidateNested({ each: true })
  @Type(() => UpdatePointDto)
  @ArrayMinSize(4)
  @IsArray()
  @IsOptional()
  ring?: UpdatePointDto[]; // Now an array of UpdatePointDto objects
}

// Represents the Polygon geometry (Optional)
class UpdateGeometryPolygonDto {
  @IsString()
  @IsOptional()
  readonly type?: string = 'Polygon';

  @ValidateNested({ each: true })
  @Type(() => UpdateLinearRingDto)
  @ArrayMinSize(1)
  @IsArray()
  @IsOptional()
  readonly coordinates?: UpdateLinearRingDto[];
}

export class UpdateFieldDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly cropType?: string;

  @IsDateString()
  @IsOptional()
  readonly bloomingPeriodStart?: string;

  @IsDateString()
  @IsOptional()
  readonly bloomingPeriodEnd?: string;

  @IsArray()
  @IsDateString({}, { each: true })
  @IsOptional()
  readonly treatmentDates?: string[];

  @ValidateNested()
  @Type(() => UpdateGeometryPolygonDto)
  @IsOptional()
  readonly geometry?: UpdateGeometryPolygonDto;
} 