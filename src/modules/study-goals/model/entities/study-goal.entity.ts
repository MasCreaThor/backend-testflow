// src/modules/study-goals/model/entities/study-goal.entity.ts
import { IStudyGoal } from '../interfaces/study-goal.interface';

export class StudyGoal implements IStudyGoal {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(goal: IStudyGoal) {
    this._id = goal._id;
    this.name = goal.name;
    this.description = goal.description;
    this.category = goal.category;
    this.isActive = goal.isActive;
    this.createdAt = goal.createdAt;
    this.updatedAt = goal.updatedAt;
  }
}