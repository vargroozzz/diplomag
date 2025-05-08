import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HivesController } from './hives.controller';
import { HivesService } from './hives.service';
import { Hive, HiveSchema } from './schemas/hive.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Hive.name, schema: HiveSchema }])],
  controllers: [HivesController],
  providers: [HivesService],
  exports: [HivesService],
})
export class HivesModule {} 