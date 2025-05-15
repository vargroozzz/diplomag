import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

// Interfaces from OpenWeatherMap structure (can be more detailed)
interface WeatherCondition {
  id: number; // Weather condition id
  main: string; // Group of weather parameters (Rain, Snow, Extreme etc.)
  description: string; // Weather condition within the group
  icon: string; // Weather icon id
}

interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

interface RainData {
  '3h'?: number; // Rain volume for last 3 hours, mm
}

interface SnowData {
  '3h'?: number; // Snow volume for last 3 hours, mm
}

interface ForecastListItem {
  dt: number; // Time of data forecasted, unix, UTC
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: { all: number }; // Cloudiness, %
  wind: { speed: number; deg: number; gust?: number }; // Wind speed, direction, gust
  visibility: number; // Average visibility, metres
  pop: number; // Probability of precipitation (from 0 to 1)
  rain?: RainData;
  snow?: SnowData;
  dt_txt: string; // Time of data forecasted, ISO, UTC e.g. "2023-05-15 18:00:00"
}

interface OpenWeatherMapForecastResponse {
  cod: string;
  message: number | string;
  cnt: number; // Number of timestamps returned
  list: ForecastListItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number; // Shift in seconds from UTC
    sunrise: number;
    sunset: number;
  };
}

// Processed forecast interfaces
export interface RelevantForecastEntry {
  time: string; // Formatted local time string
  conditionId: number;
  conditionMain: string;
  conditionDescription: string;
  temp: number;
  chanceOfPrecipitation: number; // Probability (0-1)
  rainVolume?: number; // mm in 3h
  snowVolume?: number; // mm in 3h
}

export interface ProcessedWeatherForecast {
  locationName: string;
  isRainingCurrently: boolean; // Approximation based on first few forecast slots
  willHavePrecipitationSoon: boolean; // True if any precip is expected in the "soon" window (e.g., 24h)
  nextPrecipitationTime?: string; // Formatted local time of next significant precipitation
  nextPrecipitationChance?: number;
  nextPrecipitationType?: string;
  currentWeatherDescription?: string;
  relevantForecasts: RelevantForecastEntry[]; // Key upcoming slots, especially with precipitation
}

const PRECIPITATION_WINDOW_HOURS = 24;
const SIGNIFICANT_POP_THRESHOLD = 0.1; // 10% chance

// Weather condition IDs: https://openweathermap.org/weather-conditions
// 2xx: Thunderstorm, 3xx: Drizzle, 5xx: Rain, 6xx: Snow
const PRECIPITATION_CONDITION_IDS_REGEX = /^[2356]/; 

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHERMAP_API_KEY');
    if (!this.apiKey) {
      this.logger.warn(
        'OpenWeatherMap API key not found. Weather service will not work.',
      );
    }
  }

  private async getRawForecast(
    lat: number,
    lon: number,
  ): Promise<OpenWeatherMapForecastResponse | null> {
    if (!this.apiKey) {
      this.logger.error('OpenWeatherMap API key is missing.');
      return null;
    }
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=uk`; // Added lang=uk
    this.logger.debug(`Fetching weather forecast from URL: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<OpenWeatherMapForecastResponse>(url).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Error fetching weather data: ${error.response?.status} ${JSON.stringify(error.response?.data)}`,
            );
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to get raw forecast from OpenWeatherMap',
        error.stack,
      );
      return null;
    }
  }

  public async getProcessedForecast(
    lat: number,
    lon: number,
  ): Promise<ProcessedWeatherForecast | null> {
    const rawForecast = await this.getRawForecast(lat, lon);

    if (!rawForecast || rawForecast.cod !== '200') {
      this.logger.warn(
        `Could not retrieve valid forecast data for ${lat},${lon}. Code: ${rawForecast?.cod}, Message: ${rawForecast?.message}`,
      );
      return null;
    }

    const cityTimezoneOffsetSeconds = rawForecast.city.timezone;
    const relevantForecasts: RelevantForecastEntry[] = [];
    let willHavePrecipitationSoon = false;
    let nextPrecipitationTime: string | undefined = undefined;
    let nextPrecipitationChance: number | undefined = undefined;
    let nextPrecipitationType: string | undefined = undefined;
    let isRainingCurrently = false;

    const nowUtc = Date.now();
    const soonWindowEndUtc = nowUtc + PRECIPITATION_WINDOW_HOURS * 60 * 60 * 1000;

    // Check current conditions based on first forecast item (if recent enough)
    const firstForecast = rawForecast.list[0];
    if (firstForecast) {
      if (Math.abs(nowUtc - firstForecast.dt * 1000) < 2 * 60 * 60 * 1000) { // Within 2 hours
         if (firstForecast.weather[0] && PRECIPITATION_CONDITION_IDS_REGEX.test(String(firstForecast.weather[0].id)) && firstForecast.pop >= SIGNIFICANT_POP_THRESHOLD) {
            isRainingCurrently = true;
         }
      }
    }

    for (const item of rawForecast.list) {
      const itemTimeUtc = item.dt * 1000;
      if (itemTimeUtc > soonWindowEndUtc) break; // Only process forecasts within our window

      const localTime = new Date(itemTimeUtc + cityTimezoneOffsetSeconds * 1000);
      const formattedLocalTime = localTime.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
        // weekday: 'short', // Optional: add day if forecast spans multiple days
      });

      const condition = item.weather[0];
      const entry: RelevantForecastEntry = {
        time: formattedLocalTime,
        conditionId: condition.id,
        conditionMain: condition.main,
        conditionDescription: condition.description,
        temp: Math.round(item.main.temp),
        chanceOfPrecipitation: item.pop,
        rainVolume: item.rain?.['3h'],
        snowVolume: item.snow?.['3h'],
      };
      relevantForecasts.push(entry);

      if (
        PRECIPITATION_CONDITION_IDS_REGEX.test(String(condition.id)) &&
        item.pop >= SIGNIFICANT_POP_THRESHOLD
      ) {
        willHavePrecipitationSoon = true;
        if (!nextPrecipitationTime) {
          nextPrecipitationTime = formattedLocalTime;
          nextPrecipitationChance = item.pop;
          nextPrecipitationType = condition.main;
        }
      }
    }
    
    // Ensure we only keep a reasonable number of forecasts, e.g., next 8 slots (24h)
    const limitedForecasts = relevantForecasts.slice(0, (PRECIPITATION_WINDOW_HOURS / 3) + 1); 

    return {
      locationName: rawForecast.city.name,
      isRainingCurrently,
      willHavePrecipitationSoon,
      nextPrecipitationTime,
      nextPrecipitationChance,
      nextPrecipitationType,
      currentWeatherDescription: firstForecast?.weather[0]?.description || 'N/A',
      relevantForecasts: limitedForecasts,
    };
  }
} 