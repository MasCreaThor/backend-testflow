// src/modules/study-goals/model/entities/study-goal.entity.ts
import { Types } from 'mongoose';
import { IStudyGoal } from '../interfaces/study-goal.interface';

export class StudyGoal implements IStudyGoal {
  _id: string;
  name: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  category?: {
    _id: string;
    name: string;
  };

  constructor(goal: IStudyGoal) {
    this._id = goal._id;
    this.name = goal.name;
    this.description = goal.description;
    

    if (goal.categoryId) {
      this.categoryId = goal.categoryId instanceof Types.ObjectId 
        ? goal.categoryId.toString() 
        : goal.categoryId;
    }
    
    this.isActive = goal.isActive;
    this.createdAt = goal.createdAt;
    this.updatedAt = goal.updatedAt;
    

    if (goal.category) {
      this.category = {
        _id: goal.category._id,
        name: goal.category.name
      };
    }
  }
}