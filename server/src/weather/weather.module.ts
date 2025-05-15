import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
// import { WeatherController } from './weather.controller'; // We will create this later

@Module({
  imports: [
    HttpModule, // To make HttpService available
    ConfigModule, // To make ConfigService available for API key
  ],
  providers: [WeatherService],
  controllers: [WeatherController], // Add WeatherController here
  // controllers: [WeatherController], // We will add a controller later
  exports: [WeatherService], // Export if other modules will use it directly
})
export class WeatherModule {} 