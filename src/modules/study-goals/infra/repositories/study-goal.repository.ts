// src/modules/study-goals/infra/repositories/study-goal.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyGoal, StudyGoalDocument } from '../schemas';
import { IStudyGoal } from '../../model/interfaces';
import { CreateStudyGoalDto } from '../../model/dto';

@Injectable()
export class StudyGoalRepository {
  private readonly logger = new Logger(StudyGoalRepository.name);

  constructor(
    @InjectModel(StudyGoal.name) private studyGoalModel: Model<StudyGoalDocument>,
  ) {}

  private documentToStudyGoal(doc: StudyGoalDocument): IStudyGoal {
    try {
      const goal = doc.toObject();
      const result: IStudyGoal = {
        _id: goal._id.toString(),
        name: goal.name,
        description: goal.description,
        isActive: goal.isActive,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };

      // Manejar categoryId si existe y es válido
      if (goal.categoryId && Types.ObjectId.isValid(goal.categoryId)) {
        result.categoryId = goal.categoryId.toString();
      }

      // Manejar datos populados de categoría
      if (goal.categoryId && typeof goal.categoryId === 'object' && 'name' in goal.categoryId) {
        result.category = {
          _id: goal.categoryId._id.toString(),
          name: goal.categoryId.name,
        };
      }

      return result;
    } catch (error) {
      this.logger.error(`Error al convertir documento a objeto: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Método para limpiar los documentos de la base de datos con categoryId inválido
  async fixInvalidCategoryIds(): Promise<number> {
    try {
      // Encuentra todos los documentos con una cadena vacía como categoryId y actualízalos a null
      const result = await this.studyGoalModel.updateMany(
        { categoryId: "" }, 
        { $set: { categoryId: null } }
      ).exec();
      
      this.logger.log(`Se corrigieron ${result.modifiedCount} documentos con categoryId inválido`);
      return result.modifiedCount;
    } catch (error) {
      this.logger.error(`Error al corregir categoryIds inválidos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    try {
      // Intentar corregir primero los documentos problemáticos
      await this.fixInvalidCategoryIds();
      
      const query = activeOnly ? { isActive: true } : {};
      this.logger.debug(`Buscando objetivos de estudio con query: ${JSON.stringify(query)}`);
      
      // Modificar la consulta populate para manejar categoryIds nulos o inválidos
      const goals = await this.studyGoalModel.find(query)
        .populate({
          path: 'categoryId',
          select: 'name',
          // Solo hacer populate si categoryId es válido
          match: { _id: { $exists: true, $ne: null } }
        })
        .exec();
      
      this.logger.debug(`Encontrados ${goals.length} objetivos de estudio`);
      return goals.map(goal => this.documentToStudyGoal(goal));
    } catch (error) {
      this.logger.error(`Error al buscar todos los objetivos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<IStudyGoal | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido: ${id}`);
        return null;
      }
      
      this.logger.debug(`Buscando objetivo de estudio por ID: ${id}`);
      const goal = await this.studyGoalModel.findById(id)
        .populate({
          path: 'categoryId',
          select: 'name',
          match: { _id: { $exists: true, $ne: null } }
        })
        .exec();
      
      if (!goal) {
        this.logger.debug(`No se encontró objetivo de estudio con ID: ${id}`);
        return null;
      }
      
      return this.documentToStudyGoal(goal);
    } catch (error) {
      this.logger.error(`Error al buscar objetivo por ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByIds(ids: string[]): Promise<IStudyGoal[]> {
    try {
      const validIds = ids.filter(id => Types.ObjectId.isValid(id))
                         .map(id => new Types.ObjectId(id));
      
      if (validIds.length === 0) {
        this.logger.debug('No hay IDs válidos para buscar');
        return [];
      }
      
      this.logger.debug(`Buscando objetivos de estudio por IDs: ${ids.join(', ')}`);
      const goals = await this.studyGoalModel
        .find({ _id: { $in: validIds } })
        .populate({
          path: 'categoryId',
          select: 'name',
          match: { _id: { $exists: true, $ne: null } }
        })
        .exec();
        
      return goals.map(goal => this.documentToStudyGoal(goal));
    } catch (error) {
      this.logger.error(`Error al buscar objetivos por IDs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByCategory(categoryId: string): Promise<IStudyGoal[]> {
    try {
      if (!Types.ObjectId.isValid(categoryId)) {
        this.logger.warn(`ID de categoría inválido: ${categoryId}`);
        return [];
      }

      this.logger.debug(`Buscando objetivos de estudio por categoría: ${categoryId}`);
      const goals = await this.studyGoalModel
        .find({ categoryId: new Types.ObjectId(categoryId) })
        .populate({
          path: 'categoryId',
          select: 'name',
          match: { _id: { $exists: true, $ne: null } }
        })
        .exec();

      return goals.map(goal => this.documentToStudyGoal(goal));
    } catch (error) {
      this.logger.error(`Error al buscar objetivos por categoría: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(goalData: CreateStudyGoalDto): Promise<IStudyGoal> {
    try {
      const data: any = { ...goalData };
      
      // Solo convertir a ObjectId si es una cadena no vacía y es válida
      if (goalData.categoryId && goalData.categoryId !== '' && Types.ObjectId.isValid(goalData.categoryId)) {
        data.categoryId = new Types.ObjectId(goalData.categoryId);
      } else {
        // Si es una cadena vacía o no válida, establecer como null
        data.categoryId = null;
      }
      
      this.logger.debug(`Creando nuevo objetivo de estudio: ${JSON.stringify(data)}`);
      const newGoal = new this.studyGoalModel(data);
      const savedGoal = await newGoal.save();
      
      this.logger.debug(`Objetivo de estudio creado con ID: ${savedGoal._id}`);
      
      // Populate solo si categoryId es válido
      if (savedGoal.categoryId && Types.ObjectId.isValid(savedGoal.categoryId)) {
        await savedGoal.populate('categoryId', 'name');
      }
      
      return this.documentToStudyGoal(savedGoal);
    } catch (error) {
      this.logger.error(`Error al crear objetivo de estudio: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, goalData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para actualizar: ${id}`);
        return null;
      }
      
      const data: any = { ...goalData };
      
      // Solo convertir a ObjectId si es una cadena no vacía y es válida
      if (goalData.categoryId !== undefined) {
        if (goalData.categoryId && goalData.categoryId !== '' && Types.ObjectId.isValid(goalData.categoryId)) {
          data.categoryId = new Types.ObjectId(goalData.categoryId);
        } else {
          // Si es una cadena vacía o no válida, establecer como null
          data.categoryId = null;
        }
      }
      
      this.logger.debug(`Actualizando objetivo de estudio con ID: ${id}`);
      const updatedGoal = await this.studyGoalModel
        .findByIdAndUpdate(id, data, { new: true })
        .populate({
          path: 'categoryId',
          select: 'name',
          match: { _id: { $exists: true, $ne: null } }
        })
        .exec();
        
      if (!updatedGoal) {
        this.logger.debug(`No se encontró objetivo de estudio con ID: ${id}`);
        return null;
      }
      
      return this.documentToStudyGoal(updatedGoal);
    } catch (error) {
      this.logger.error(`Error al actualizar objetivo de estudio: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<IStudyGoal | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para eliminar: ${id}`);
        return null;
      }
      
      this.logger.debug(`Eliminando objetivo de estudio con ID: ${id}`);
      const deletedGoal = await this.studyGoalModel.findByIdAndDelete(id).exec();
      
      if (!deletedGoal) {
        this.logger.debug(`No se encontró objetivo de estudio con ID: ${id}`);
        return null;
      }
      
      return this.documentToStudyGoal(deletedGoal);
    } catch (error) {
      this.logger.error(`Error al eliminar objetivo de estudio: ${error.message}`, error.stack);
      throw error;
    }
  }
}