// src/modules/categories/model/entities/category.entity.ts
import { ICategory } from '../interfaces/category.interface';

export class Category implements ICategory {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(category: ICategory) {
    this._id = category._id;
    this.name = category.name;
    this.description = category.description;
    this.isActive = category.isActive;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}