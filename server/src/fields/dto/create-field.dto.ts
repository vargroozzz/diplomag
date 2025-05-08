import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray, ArrayMinSize, IsDateString, IsEnum, ArrayNotEmpty, ArrayMaxSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Represents a single point { lng, lat }
class PointDto {
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @IsNumber()
  @IsNotEmpty()
  lat: number;
}

// Represents a LinearRing (array of points)
class LinearRingDto {
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  @ArrayMinSize(4) // GeoJSON spec: LinearRing needs >= 4 points (first=last)
  @IsArray()
  ring: PointDto[];
}

// Represents the Polygon geometry
class GeometryPolygonDto {
  @IsString()
  @IsNotEmpty()
  readonly type: string = 'Polygon';

  @ValidateNested({ each: true })
  @Type(() => LinearRingDto)
  @ArrayMinSize(1) // Must have at least the outer ring
  @IsArray()
  // This validates the array of LinearRings (usually just one for simple polygons)
  readonly coordinates: LinearRingDto[];
}

export class CreateFieldDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly cropType: string;

  @IsDateString()
  @IsNotEmpty()
  readonly bloomingPeriodStart: string;

  @IsDateString()
  @IsNotEmpty()
  readonly bloomingPeriodEnd: string;

  @IsArray()
  @IsDateString({}, { each: true })
  @IsOptional()
  readonly treatmentDates?: string[];

  @ValidateNested()
  @Type(() => GeometryPolygonDto)
  @IsNotEmpty()
  readonly geometry: GeometryPolygonDto;
} 