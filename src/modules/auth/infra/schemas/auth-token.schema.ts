// src/modules/auth/infra/schemas/auth-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthTokenDocument = AuthToken & Document;

@Schema({ timestamps: true })
export class AuthToken {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ default: 'refresh' })
  type: string; // 'refresh' o 'reset'
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);