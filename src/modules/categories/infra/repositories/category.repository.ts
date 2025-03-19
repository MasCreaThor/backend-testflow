// src/modules/categories/infra/repositories/category.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { ICategory } from '../../model/interfaces/category.interface';
import { CreateCategoryDto } from '../../model/dto/create-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private documentToCategory(doc: CategoryDocument): ICategory {
    const category = doc.toObject();
    return {
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async findAll(activeOnly: boolean = false): Promise<ICategory[]> {
    const query = activeOnly ? { isActive: true } : {};
    const categories = await this.categoryModel.find(query).exec();
    return categories.map(category => this.documentToCategory(category));
  }

  async findById(id: string): Promise<ICategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const category = await this.categoryModel.findById(id).exec();
    return category ? this.documentToCategory(category) : null;
  }

  async findByName(name: string): Promise<ICategory | null> {
    const category = await this.categoryModel.findOne({ name }).exec();
    return category ? this.documentToCategory(category) : null;
  }

  async create(categoryData: CreateCategoryDto): Promise<ICategory> {
    const newCategory = new this.categoryModel(categoryData);
    const savedCategory = await newCategory.save();
    return this.documentToCategory(savedCategory);
  }

  async update(id: string, categoryData: Partial<CreateCategoryDto>): Promise<ICategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, categoryData, { new: true })
      .exec();
      
    return updatedCategory ? this.documentToCategory(updatedCategory) : null;
  }

  async delete(id: string): Promise<ICategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    return deletedCategory ? this.documentToCategory(deletedCategory) : null;
  }
}