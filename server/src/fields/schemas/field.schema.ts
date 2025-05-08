import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the GeoJSON Polygon structure - Reverted to standard array format for 2dsphere index
@Schema({ _id: false })
class Polygon {
  @Prop({ type: String, enum: ['Polygon'], required: true, default: 'Polygon' })
  type: string;

  // Use standard GeoJSON coordinate array structure: [[[lng, lat], ...]]
  @Prop({ type: [[[Number]]], required: true }) 
  coordinates: number[][][];
}
const PolygonSchema = SchemaFactory.createForClass(Polygon);

export type FieldDocument = Field & Document;

@Schema({ timestamps: true })
export class Field {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cropType: string; // Consider Enum later

  @Prop({ type: Date, required: true })
  bloomingPeriodStart: Date;

  @Prop({ type: Date, required: true })
  bloomingPeriodEnd: Date;

  @Prop({ type: [Date], default: [] })
  treatmentDates?: Date[];

  // Use the standard PolygonSchema for geometry
  @Prop({ type: PolygonSchema, required: true, index: '2dsphere' }) 
  geometry: Polygon;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;
}

export const FieldSchema = SchemaFactory.createForClass(Field); 