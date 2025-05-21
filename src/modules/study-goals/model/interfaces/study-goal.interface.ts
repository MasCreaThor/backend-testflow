// src/modules/study-goals/model/interfaces/study-goal.interface.ts
import { Types } from 'mongoose';

export interface IStudyGoal {
  _id: string;
  name: string;
  description?: string;
  categoryId?: string | Types.ObjectId;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  category?: {
    _id: string;
    name: string;
  };
}