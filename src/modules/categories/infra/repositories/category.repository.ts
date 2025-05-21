// src/modules/categories/infra/repositories/category.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { ICategory } from '../../model/interfaces/category.interface';
import { CreateCategoryDto } from '../../model/dto/create-category.dto';
import { UpdateCategoryDto } from '../../model/dto/update-category.dto';
import { LoggerService } from '../../../../shared/services/logger.service';

/**
 * Repositorio para operaciones de base de datos relacionadas con categorías
 */
@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CategoryRepository.name);
  }

  /**
   * Convierte un documento de MongoDB a una interfaz de categoría
   * @param doc Documento de categoría de MongoDB
   * @returns Interfaz de categoría
   */
  private documentToCategory(doc: CategoryDocument): ICategory {
    try {
      const category = doc.toObject();
      return {
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error al convertir documento a categoría: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías
   * @param activeOnly Filtrar solo categorías activas
   * @returns Lista de categorías
   */
  async findAll(activeOnly: boolean = false): Promise<ICategory[]> {
    try {
      const query = activeOnly ? { isActive: true } : {};
      this.logger.debug(`Ejecutando consulta findAll con filtro: ${JSON.stringify(query)}`);
      
      const categories = await this.categoryModel.find(query).exec();
      this.logger.debug(`Encontradas ${categories.length} categorías`);
      
      return categories.map(category => this.documentToCategory(category));
    } catch (error) {
      this.logger.error(`Error en findAll: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca una categoría por su ID
   * @param id ID de la categoría
   * @returns Categoría encontrada o null
   */
  async findById(id: string): Promise<ICategory | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido: ${id}`);
        return null;
      }
      
      this.logger.debug(`Buscando categoría con ID: ${id}`);
      const category = await this.categoryModel.findById(id).exec();
      
      if (!category) {
        this.logger.debug(`No se encontró categoría con ID: ${id}`);
        return null;
      }
      
      return this.documentToCategory(category);
    } catch (error) {
      this.logger.error(`Error en findById: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca una categoría por su nombre
   * @param name Nombre de la categoría
   * @returns Categoría encontrada o null
   */
  async findByName(name: string): Promise<ICategory | null> {
    try {
      this.logger.debug(`Buscando categoría con nombre: ${name}`);
      const category = await this.categoryModel.findOne({ name }).exec();
      
      if (!category) {
        this.logger.debug(`No se encontró categoría con nombre: ${name}`);
        return null;
      }
      
      return this.documentToCategory(category);
    } catch (error) {
      this.logger.error(`Error en findByName: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría
   * @param categoryData Datos de la categoría
   * @returns Categoría creada
   */
  async create(categoryData: CreateCategoryDto): Promise<ICategory> {
    try {
      this.logger.debug(`Creando nueva categoría: ${JSON.stringify(categoryData)}`);
      const newCategory = new this.categoryModel(categoryData);
      const savedCategory = await newCategory.save();
      
      this.logger.debug(`Categoría creada con ID: ${savedCategory._id}`);
      return this.documentToCategory(savedCategory);
    } catch (error) {
      this.logger.error(`Error en create: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente
   * @param id ID de la categoría
   * @param categoryData Datos actualizados
   * @returns Categoría actualizada o null
   */
  async update(id: string, categoryData: UpdateCategoryDto): Promise<ICategory | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para actualizar: ${id}`);
        return null;
      }
      
      this.logger.debug(`Actualizando categoría ${id}: ${JSON.stringify(categoryData)}`);
      
      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, categoryData, { new: true })
        .exec();
        
      if (!updatedCategory) {
        this.logger.debug(`No se encontró categoría con ID: ${id}`);
        return null;
      }
      
      return this.documentToCategory(updatedCategory);
    } catch (error) {
      this.logger.error(`Error en update: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Elimina una categoría
   * @param id ID de la categoría
   * @returns Categoría eliminada o null
   */
  async delete(id: string): Promise<ICategory | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para eliminar: ${id}`);
        return null;
      }
      
      this.logger.debug(`Eliminando categoría con ID: ${id}`);
      
      const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
      
      if (!deletedCategory) {
        this.logger.debug(`No se encontró categoría con ID: ${id}`);
        return null;
      }
      
      return this.documentToCategory(deletedCategory);
    } catch (error) {
      this.logger.error(`Error en delete: ${error.message}`, error.stack);
      throw error;
    }
  }
}