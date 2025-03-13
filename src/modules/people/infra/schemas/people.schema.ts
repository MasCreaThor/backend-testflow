// src/modules/people/infra/schemas/people.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PeopleDocument = People & Document;

@Schema({ timestamps: true })
export class People {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: String, default: '' })
  profileImage: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'StudyGoal' }], default: [] })
  studyGoals: Types.ObjectId[];
}

export const PeopleSchema = SchemaFactory.createForClass(People);