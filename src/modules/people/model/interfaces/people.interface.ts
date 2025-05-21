// src/modules/people/model/interfaces/people.interface.ts
import { Types } from 'mongoose';

export interface IPeople {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  studyGoals?: string[] | Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}