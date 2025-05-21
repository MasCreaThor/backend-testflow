// src/modules/categories/services/category.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CategoryRepository } from '../infra/repositories/category.repository';
import { CreateCategoryDto } from '../model/dto/create-category.dto';
import { UpdateCategoryDto } from '../model/dto/update-category.dto';
import { ICategory } from '../model/interfaces/category.interface';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para la gestión de categorías
 */
@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CategoryService.name);
  }

  /**
   * Obtiene todas las categorías
   * @param activeOnly Filtrar solo categorías activas
   * @returns Lista de categorías
   */
  async findAll(activeOnly: boolean = false): Promise<ICategory[]> {
    try {
      this.logger.debug(`Buscando todas las categorías. activeOnly=${activeOnly}`);
      const categories = await this.categoryRepository.findAll(activeOnly);
      this.logger.debug(`Encontradas ${categories.length} categorías`);
      return categories;
    } catch (error) {
      this.logger.error(`Error al obtener todas las categorías: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener las categorías');
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param id ID de la categoría
   * @returns Categoría encontrada
   * @throws NotFoundException si la categoría no existe
   */
  async findById(id: string): Promise<ICategory> {
    try {
      this.logger.debug(`Buscando categoría con ID: ${id}`);
      const category = await this.categoryRepository.findById(id);
      
      if (!category) {
        this.logger.warn(`Categoría con ID ${id} no encontrada`);
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar categoría por ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar la categoría');
    }
  }

  /**
   * Crea una nueva categoría
   * @param createCategoryDto Datos para crear la categoría
   * @returns Categoría creada
   * @throws ConflictException si ya existe una categoría con el mismo nombre
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    try {
      this.logger.debug(`Verificando si ya existe una categoría con nombre: ${createCategoryDto.name}`);
      const existingCategory = await this.categoryRepository.findByName(createCategoryDto.name);
      
      if (existingCategory) {
        this.logger.warn(`Ya existe una categoría con el nombre ${createCategoryDto.name}`);
        throw new ConflictException(`Ya existe una categoría con el nombre ${createCategoryDto.name}`);
      }
      
      this.logger.debug(`Creando nueva categoría: ${createCategoryDto.name}`);
      const newCategory = await this.categoryRepository.create(createCategoryDto);
      this.logger.log(`Categoría creada con ID: ${newCategory._id}`);
      
      return newCategory;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error al crear categoría: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear la categoría');
    }
  }

  /**
   * Actualiza una categoría existente
   * @param id ID de la categoría a actualizar
   * @param updateData Datos para actualizar la categoría
   * @returns Categoría actualizada
   * @throws NotFoundException si la categoría no existe
   * @throws ConflictException si el nuevo nombre ya está en uso
   */
  async update(id: string, updateData: UpdateCategoryDto): Promise<ICategory> {
    try {
      // Verificar si la categoría existe
      this.logger.debug(`Verificando si existe la categoría con ID: ${id}`);
      const existingCategory = await this.categoryRepository.findById(id);
      
      if (!existingCategory) {
        this.logger.warn(`Categoría con ID ${id} no encontrada`);
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      // Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
      if (updateData.name) {
        this.logger.debug(`Verificando si ya existe otra categoría con nombre: ${updateData.name}`);
        const categoryWithSameName = await this.categoryRepository.findByName(updateData.name);
        
        if (categoryWithSameName && categoryWithSameName._id !== id) {
          this.logger.warn(`Ya existe otra categoría con el nombre ${updateData.name}`);
          throw new ConflictException(`Ya existe otra categoría con el nombre ${updateData.name}`);
        }
      }
      
      // Actualizar categoría
      this.logger.debug(`Actualizando categoría con ID: ${id}`);
      const updatedCategory = await this.categoryRepository.update(id, updateData);
      
      if (!updatedCategory) {
        this.logger.warn(`Categoría con ID ${id} no encontrada`);
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      
      this.logger.log(`Categoría actualizada: ${updatedCategory._id}`);
      return updatedCategory;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error al actualizar categoría: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar la categoría');
    }
  }

  /**
   * Elimina una categoría
   * @param id ID de la categoría a eliminar
   * @throws NotFoundException si la categoría no existe
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.debug(`Eliminando categoría con ID: ${id}`);
      const deletedCategory = await this.categoryRepository.delete(id);
      
      if (!deletedCategory) {
        this.logger.warn(`Categoría con ID ${id} no encontrada`);
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      
      this.logger.log(`Categoría eliminada: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar categoría: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar la categoría');
    }
  }
}