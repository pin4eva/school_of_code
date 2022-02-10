import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = Document & User;

@Schema()
export class User {
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  otherName: string;
  @Prop()
  name: string;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  phone: string;
  @Prop()
  role: string;
  @Prop()
  google_id: string;
  @Prop()
  username: string;
  @Prop()
  emailToken: string;
  @Prop({ type: Boolean, default: false })
  isActive: boolean;
  @Prop()
  image: string;
  @Prop()
  lastSeen: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
