// src/modules/study-goals/services/study-goal.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories/category.repository';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';

@Injectable()
export class StudyGoalService {
  private readonly logger = new Logger(StudyGoalService.name);

  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    this.logger.log(`Buscando todos los objetivos de estudio. activeOnly=${activeOnly}`);
    try {
      const goals = await this.studyGoalRepository.findAll(activeOnly);
      this.logger.log(`Encontrados ${goals.length} objetivos de estudio`);
      return goals;
    } catch (error) {
      this.logger.error(`Error al buscar todos los objetivos de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar objetivos de estudio', { cause: error });
    }
  }

  async findById(id: string): Promise<IStudyGoal> {
    this.logger.log(`Buscando objetivo de estudio por ID: ${id}`);
    try {
      const goal = await this.studyGoalRepository.findById(id);
      if (!goal) {
        this.logger.warn(`Objetivo de estudio con ID ${id} no encontrado`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }
      return goal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error al buscar objetivo de estudio por ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar el objetivo de estudio', { cause: error });
    }
  }

  async findByCategory(categoryId: string): Promise<IStudyGoal[]> {
    this.logger.log(`Buscando objetivos de estudio por categoría: ${categoryId}`);
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        this.logger.warn(`Categoría con ID ${categoryId} no encontrada`);
        throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
      }

      const goals = await this.studyGoalRepository.findByCategory(categoryId);
      this.logger.log(`Encontrados ${goals.length} objetivos de estudio para la categoría ${categoryId}`);
      return goals;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error al buscar objetivos por categoría: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar objetivos por categoría', { cause: error });
    }
  }

  async create(createStudyGoalDto: CreateStudyGoalDto): Promise<IStudyGoal> {
    this.logger.log(`Creando objetivo de estudio: ${JSON.stringify(createStudyGoalDto)}`);
    try {
      if (createStudyGoalDto.categoryId) {
        const category = await this.categoryRepository.findById(createStudyGoalDto.categoryId);
        if (!category) {
          this.logger.warn(`La categoría con ID ${createStudyGoalDto.categoryId} no existe`);
          throw new BadRequestException(`La categoría con ID ${createStudyGoalDto.categoryId} no existe`);
        }
      }
      
      const newGoal = await this.studyGoalRepository.create(createStudyGoalDto);
      this.logger.log(`Objetivo de estudio creado con ID: ${newGoal._id}`);
      return newGoal;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error al crear objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear el objetivo de estudio', { cause: error });
    }
  }

  async update(id: string, updateData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal> {
    this.logger.log(`Actualizando objetivo de estudio ID: ${id}, datos: ${JSON.stringify(updateData)}`);
    try {
      if (updateData.categoryId) {
        const category = await this.categoryRepository.findById(updateData.categoryId);
        if (!category) {
          this.logger.warn(`La categoría con ID ${updateData.categoryId} no existe`);
          throw new BadRequestException(`La categoría con ID ${updateData.categoryId} no existe`);
        }
      }
      
      const updatedGoal = await this.studyGoalRepository.update(id, updateData);
      if (!updatedGoal) {
        this.logger.warn(`Objetivo de estudio con ID ${id} no encontrado`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }
      this.logger.log(`Objetivo de estudio actualizado: ${updatedGoal.name}`);
      return updatedGoal;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error al actualizar objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar el objetivo de estudio', { cause: error });
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Eliminando objetivo de estudio ID: ${id}`);
    try {
      const deletedGoal = await this.studyGoalRepository.delete(id);
      if (!deletedGoal) {
        this.logger.warn(`Objetivo de estudio con ID ${id} no encontrado`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }
      this.logger.log(`Objetivo de estudio eliminado con éxito: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error al eliminar objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar el objetivo de estudio', { cause: error });
    }
  }
}