import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ForumModule } from './forum/forum.module';
import { EventsModule } from './events/events.module';
import { ArticlesModule } from './articles/articles.module';
import { HivesModule } from './hives/hives.module';
import { FieldsModule } from './fields/fields.module';
import { HealthModule } from './health/health.module';
import { WeatherModule } from './weather/weather.module';
// import { FaqModule } from './faq/faq.module'; // Commented out to disable FAQ endpoint

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ForumModule,
    EventsModule,
    ArticlesModule,
    HivesModule,
    FieldsModule,
    HealthModule,
    WeatherModule,
    // FaqModule, // Commented out
  ],
})
export class AppModule {} 