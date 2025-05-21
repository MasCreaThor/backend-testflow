// src/modules/study-goals/infra/schemas/study-goal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudyGoalDocument = StudyGoal & Document;

@Schema({ timestamps: true })
export class StudyGoal {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;
  
  @Prop({ default: true })
  isActive: boolean;
}

export const StudyGoalSchema = SchemaFactory.createForClass(StudyGoal);