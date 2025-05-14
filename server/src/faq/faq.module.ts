import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { ConfigModule } from '@nestjs/config'; // FaqService uses ConfigService

@Module({
  imports: [ConfigModule], 
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {} 