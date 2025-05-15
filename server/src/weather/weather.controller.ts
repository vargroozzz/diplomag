import { Controller, Get, Query, Logger, HttpException, HttpStatus, Version } from '@nestjs/common';
import { WeatherService, ProcessedWeatherForecast } from './weather.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Get('forecast')
  @Version('1')
  @ApiOperation({ summary: 'Get processed weather forecast for given coordinates' })
  @ApiQuery({ name: 'lat', type: 'number', required: true, description: 'Latitude' })
  @ApiQuery({ name: 'lon', type: 'number', required: true, description: 'Longitude' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved processed weather forecast',
    type: Object, // We should define a DTO for ProcessedWeatherForecast if we want better Swagger type
  })
  @ApiResponse({ status: 400, description: 'Invalid latitude or longitude' })
  @ApiResponse({ status: 503, description: 'Weather service unavailable or API key missing' })
  async getProcessedForecast(
    @Query('lat') latString: string,
    @Query('lon') lonString: string,
  ): Promise<ProcessedWeatherForecast | null> {
    const lat = parseFloat(latString);
    const lon = parseFloat(lonString);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new HttpException('Invalid latitude or longitude provided', HttpStatus.BAD_REQUEST);
    }

    this.logger.debug(`Received request for processed forecast: lat=${lat}, lon=${lon}`);
    const forecast = await this.weatherService.getProcessedForecast(lat, lon);
    if (!forecast && !this.weatherService['apiKey']) { // Check if API key was the issue
        throw new HttpException('Weather service temporarily unavailable due to configuration issue.', HttpStatus.SERVICE_UNAVAILABLE);
    }
    // If forecast is null for other reasons (e.g., OpenWeatherMap API error), 
    // it will be returned as null, and client can handle it.
    return forecast;
  }
} 