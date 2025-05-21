// src/modules/roles/infra/schemas/user-role.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRoleDocument = UserRole & Document;

@Schema({ timestamps: true })
export class UserRole {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId;

  @Prop()
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  grantedBy: Types.ObjectId;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);


UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });