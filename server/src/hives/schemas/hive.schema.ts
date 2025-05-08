import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the GeoJSON Point structure
@Schema({ _id: false })
class Point {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}
const PointSchema = SchemaFactory.createForClass(Point);

export type HiveDocument = Hive & Document;

@Schema({ timestamps: true })
export class Hive {
  @Prop({ required: true })
  name: string;

  @Prop()
  notes?: string;

  @Prop({ type: PointSchema, required: true, index: '2dsphere' })
  location: Point;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;
}

export const HiveSchema = SchemaFactory.createForClass(Hive); 