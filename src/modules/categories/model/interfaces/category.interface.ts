// src/modules/categories/model/interfaces/category.interface.ts
export interface ICategory {
    _id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }