// src/modules/categories/services/category.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from '../infra/repositories/category.repository';
import { CreateCategoryDto } from '../model/dto/create-category.dto';
import { ICategory } from '../model/interfaces/category.interface';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<ICategory[]> {
    return this.categoryRepository.findAll(activeOnly);
  }

  async findById(id: string): Promise<ICategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<ICategory> {

    const existingCategory = await this.categoryRepository.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException(`Ya existe una categoría con el nombre ${createCategoryDto.name}`);
    }
    
    return this.categoryRepository.create(createCategoryDto);
  }

  async update(id: string, updateData: Partial<CreateCategoryDto>): Promise<ICategory> {

    if (updateData.name) {
      const existingCategory = await this.categoryRepository.findByName(updateData.name);
      if (existingCategory && existingCategory._id !== id) {
        throw new ConflictException(`Ya existe otra categoría con el nombre ${updateData.name}`);
      }
    }
    
    const updatedCategory = await this.categoryRepository.update(id, updateData);
    if (!updatedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return updatedCategory;
  }

  async delete(id: string): Promise<void> {
    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
  }
}