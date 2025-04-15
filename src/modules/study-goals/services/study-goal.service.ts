// src/modules/study-goals/services/study-goal.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories/category.repository';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';
import { 
  NotFoundException, 
  BadRequestException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';
import { Helper } from '../../../common/utils';

@Injectable()
export class StudyGoalService {
  private readonly logger = new Logger(StudyGoalService.name);

  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    try {
      this.logger.log(`Finding all study goals. activeOnly=${activeOnly}`);
      const goals = await this.studyGoalRepository.findAll(activeOnly);
      this.logger.log(`Found ${goals.length} study goals`);
      return goals;
    } catch (error) {
      this.logger.error(`Error finding all study goals: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al buscar objetivos de estudio', 
        'FIND_STUDY_GOALS_ERROR',
        { originalError: error.message }
      );
    }
  }

  async findById(id: string): Promise<IStudyGoal> {
    try {
      this.logger.log(`Finding study goal by ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid study goal ID format: ${id}`);
        throw new BadRequestException(
          'ID de objetivo de estudio inválido',
          'INVALID_STUDY_GOAL_ID'
        );
      }
      
      const goal = await this.studyGoalRepository.findById(id);
      if (!goal) {
        this.logger.warn(`Study goal with ID ${id} not found`);
        throw new NotFoundException(
          `Objetivo de estudio con ID ${id} no encontrado`,
          'STUDY_GOAL_NOT_FOUND',
          { studyGoalId: id }
        );
      }
      
      return goal;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding study goal by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al buscar el objetivo de estudio', 
        'FIND_STUDY_GOAL_ERROR',
        { originalError: error.message, studyGoalId: id }
      );
    }
  }

  async findByCategory(categoryId: string): Promise<IStudyGoal[]> {
    try {
      this.logger.log(`Finding study goals by category: ${categoryId}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(categoryId)) {
        this.logger.warn(`Invalid category ID format: ${categoryId}`);
        throw new BadRequestException(
          'ID de categoría inválido',
          'INVALID_CATEGORY_ID'
        );
      }
      
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        this.logger.warn(`Category with ID ${categoryId} not found`);
        throw new NotFoundException(
          `Categoría con ID ${categoryId} no encontrada`,
          'CATEGORY_NOT_FOUND',
          { categoryId }
        );
      }

      const goals = await this.studyGoalRepository.findByCategory(categoryId);
      this.logger.log(`Found ${goals.length} study goals for category ${categoryId}`);
      return goals;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding study goals by category: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al buscar objetivos por categoría', 
        'FIND_BY_CATEGORY_ERROR',
        { originalError: error.message, categoryId }
      );
    }
  }

  async create(createStudyGoalDto: CreateStudyGoalDto): Promise<IStudyGoal> {
    try {
      this.logger.log(`Creating study goal: ${JSON.stringify(createStudyGoalDto)}`);
      
      if (createStudyGoalDto.categoryId) {
        // Validate Category ID format
        if (!Helper.isValidObjectId(createStudyGoalDto.categoryId)) {
          this.logger.warn(`Invalid category ID format: ${createStudyGoalDto.categoryId}`);
          throw new BadRequestException(
            'ID de categoría inválido',
            'INVALID_CATEGORY_ID'
          );
        }
        
        const category = await this.categoryRepository.findById(createStudyGoalDto.categoryId);
        if (!category) {
          this.logger.warn(`Category with ID ${createStudyGoalDto.categoryId} not found`);
          throw new NotFoundException(
            `La categoría con ID ${createStudyGoalDto.categoryId} no existe`,
            'CATEGORY_NOT_FOUND',
            { categoryId: createStudyGoalDto.categoryId }
          );
        }
      }
      
      const newGoal = await this.studyGoalRepository.create(createStudyGoalDto);
      this.logger.log(`Study goal created with ID: ${newGoal._id}`);
      return newGoal;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof BadRequestException ||
          error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error creating study goal: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al crear el objetivo de estudio', 
        'CREATE_STUDY_GOAL_ERROR',
        { originalError: error.message }
      );
    }
  }

  async update(id: string, updateData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal> {
    try {
      this.logger.log(`Updating study goal ID: ${id}, data: ${JSON.stringify(updateData)}`);
      
      // Validate Study Goal ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid study goal ID format: ${id}`);
        throw new BadRequestException(
          'ID de objetivo de estudio inválido',
          'INVALID_STUDY_GOAL_ID'
        );
      }
      
      if (updateData.categoryId) {
        // Validate Category ID format
        if (!Helper.isValidObjectId(updateData.categoryId)) {
          this.logger.warn(`Invalid category ID format: ${updateData.categoryId}`);
          throw new BadRequestException(
            'ID de categoría inválido',
            'INVALID_CATEGORY_ID'
          );
        }
        
        const category = await this.categoryRepository.findById(updateData.categoryId);
        if (!category) {
          this.logger.warn(`Category with ID ${updateData.categoryId} not found`);
          throw new NotFoundException(
            `La categoría con ID ${updateData.categoryId} no existe`,
            'CATEGORY_NOT_FOUND',
            { categoryId: updateData.categoryId }
          );
        }
      }
      
      const updatedGoal = await this.studyGoalRepository.update(id, updateData);
      if (!updatedGoal) {
        this.logger.warn(`Study goal with ID ${id} not found for update`);
        throw new NotFoundException(
          `Objetivo de estudio con ID ${id} no encontrado`,
          'STUDY_GOAL_NOT_FOUND',
          { studyGoalId: id }
        );
      }
      
      this.logger.log(`Study goal updated: ${updatedGoal.name}`);
      return updatedGoal;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof BadRequestException ||
          error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error updating study goal: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al actualizar el objetivo de estudio', 
        'UPDATE_STUDY_GOAL_ERROR',
        { originalError: error.message, studyGoalId: id }
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting study goal ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid study goal ID format: ${id}`);
        throw new BadRequestException(
          'ID de objetivo de estudio inválido',
          'INVALID_STUDY_GOAL_ID'
        );
      }
      
      const deletedGoal = await this.studyGoalRepository.delete(id);
      if (!deletedGoal) {
        this.logger.warn(`Study goal with ID ${id} not found for deletion`);
        throw new NotFoundException(
          `Objetivo de estudio con ID ${id} no encontrado`,
          'STUDY_GOAL_NOT_FOUND',
          { studyGoalId: id }
        );
      }
      
      this.logger.log(`Study goal deleted successfully: ${id}`);
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error deleting study goal: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al eliminar el objetivo de estudio', 
        'DELETE_STUDY_GOAL_ERROR',
        { originalError: error.message, studyGoalId: id }
      );
    }
  }
}