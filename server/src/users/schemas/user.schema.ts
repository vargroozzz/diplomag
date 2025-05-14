import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop([String])
  expertise?: string[];

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, select: false })
  emailVerificationToken?: string;

  @Prop({ type: Date, select: false })
  emailVerificationExpires?: Date;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ type: Number, min: 0 })
  hiveCount?: number;

  @Prop({ type: Number, min: 0 })
  yearsOfExperience?: number;

  @Prop([String])
  beeTypes?: string[];

  @Prop([String])
  primaryForage?: string[];

  @Prop([String])
  beekeepingInterests?: string[];

  @Prop()
  lookingFor?: string;

  @Prop()
  offering?: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 