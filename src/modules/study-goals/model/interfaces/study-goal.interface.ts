// src/modules/study-goals/model/interfaces/study-goal.interface.ts
export interface IStudyGoal {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }