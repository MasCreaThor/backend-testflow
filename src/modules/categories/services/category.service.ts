// src/modules/categories/services/category.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CategoryRepository } from '../infra/repositories/category.repository';
import { CreateCategoryDto } from '../model/dto/create-category.dto';
import { ICategory } from '../model/interfaces/category.interface';
import { 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';
import { Helper } from '../../../common/utils';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<ICategory[]> {
    try {
      this.logger.debug(`Finding all categories with activeOnly=${activeOnly}`);
      const categories = await this.categoryRepository.findAll(activeOnly);
      this.logger.debug(`Found ${categories.length} categories`);
      return categories;
    } catch (error) {
      this.logger.error(`Error finding all categories: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al obtener categorías',
        'FIND_ALL_CATEGORIES_ERROR',
        { originalError: error.message }
      );
    }
  }

  async findById(id: string): Promise<ICategory> {
    try {
      this.logger.debug(`Finding category by ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid category ID format: ${id}`);
        throw new BadRequestException(
          'ID de categoría inválido',
          'INVALID_CATEGORY_ID'
        );
      }
      
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        this.logger.warn(`Category with ID ${id} not found`);
        throw new NotFoundException(
          `Categoría con ID ${id} no encontrada`,
          'CATEGORY_NOT_FOUND',
          { categoryId: id }
        );
      }
      
      this.logger.debug(`Category found: ${category.name}`);
      return category;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding category by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al buscar la categoría',
        'FIND_CATEGORY_ERROR',
        { originalError: error.message, categoryId: id }
      );
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    try {
      this.logger.log(`Creating new category: ${createCategoryDto.name}`);

      const existingCategory = await this.categoryRepository.findByName(createCategoryDto.name);
      if (existingCategory) {
        this.logger.warn(`Category with name "${createCategoryDto.name}" already exists`);
        throw new ConflictException(
          `Ya existe una categoría con el nombre ${createCategoryDto.name}`,
          'CATEGORY_NAME_ALREADY_EXISTS',
          { categoryName: createCategoryDto.name }
        );
      }
      
      const newCategory = await this.categoryRepository.create(createCategoryDto);
      this.logger.log(`Category created successfully with ID: ${newCategory._id}`);
      return newCategory;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al crear la categoría',
        'CREATE_CATEGORY_ERROR',
        { originalError: error.message }
      );
    }
  }

  async update(id: string, updateData: Partial<CreateCategoryDto>): Promise<ICategory> {
    try {
      this.logger.log(`Updating category with ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid category ID format: ${id}`);
        throw new BadRequestException(
          'ID de categoría inválido',
          'INVALID_CATEGORY_ID'
        );
      }

      if (updateData.name) {
        const existingCategory = await this.categoryRepository.findByName(updateData.name);
        if (existingCategory && existingCategory._id !== id) {
          this.logger.warn(`Another category with name "${updateData.name}" already exists`);
          throw new ConflictException(
            `Ya existe otra categoría con el nombre ${updateData.name}`,
            'CATEGORY_NAME_ALREADY_EXISTS',
            { categoryName: updateData.name }
          );
        }
      }
      
      const updatedCategory = await this.categoryRepository.update(id, updateData);
      if (!updatedCategory) {
        this.logger.warn(`Category with ID ${id} not found for update`);
        throw new NotFoundException(
          `Categoría con ID ${id} no encontrada`,
          'CATEGORY_NOT_FOUND',
          { categoryId: id }
        );
      }
      
      this.logger.log(`Category updated successfully: ${updatedCategory.name}`);
      return updatedCategory;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al actualizar la categoría',
        'UPDATE_CATEGORY_ERROR',
        { originalError: error.message, categoryId: id }
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting category with ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid category ID format: ${id}`);
        throw new BadRequestException(
          'ID de categoría inválido',
          'INVALID_CATEGORY_ID'
        );
      }
      
      const deletedCategory = await this.categoryRepository.delete(id);
      if (!deletedCategory) {
        this.logger.warn(`Category with ID ${id} not found for deletion`);
        throw new NotFoundException(
          `Categoría con ID ${id} no encontrada`,
          'CATEGORY_NOT_FOUND',
          { categoryId: id }
        );
      }
      
      this.logger.log(`Category deleted successfully: ${id}`);
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error deleting category: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al eliminar la categoría',
        'DELETE_CATEGORY_ERROR',
        { originalError: error.message, categoryId: id }
      );
    }
  }
}