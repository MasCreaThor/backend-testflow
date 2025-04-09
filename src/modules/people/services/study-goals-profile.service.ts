// src/modules/people/services/study-goals-profile.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { IPeople } from '../model/interfaces';
import { 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';
import { Helper } from '../../../common/utils';

@Injectable()
export class StudyGoalsProfileService {
  private readonly logger = new Logger(StudyGoalsProfileService.name);

  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
  ) {}

  async addStudyGoal(peopleId: string, goalId: string): Promise<IPeople> {
    try {
      this.logger.log(`Adding study goal ${goalId} to person ${peopleId}`);
      
      // Validate ID format for both IDs
      if (!Helper.isValidObjectId(peopleId)) {
        this.logger.warn(`Invalid person ID format: ${peopleId}`);
        throw new BadRequestException(
          'ID de persona inválido',
          'INVALID_PERSON_ID'
        );
      }
      
      if (!Helper.isValidObjectId(goalId)) {
        this.logger.warn(`Invalid study goal ID format: ${goalId}`);
        throw new BadRequestException(
          'ID de objetivo de estudio inválido',
          'INVALID_GOAL_ID'
        );
      }
      
      // Verificar si existe la persona
      const person = await this.peopleRepository.findById(peopleId);
      if (!person) {
        this.logger.warn(`Person with ID ${peopleId} not found`);
        throw new NotFoundException(
          `Persona con ID ${peopleId} no encontrada`,
          'PERSON_NOT_FOUND',
          { peopleId }
        );
      }
      
      // Verificar si existe el objetivo
      const goal = await this.studyGoalRepository.findById(goalId);
      if (!goal) {
        this.logger.warn(`Study goal with ID ${goalId} not found`);
        throw new NotFoundException(
          `Objetivo de estudio con ID ${goalId} no encontrado`,
          'STUDY_GOAL_NOT_FOUND',
          { goalId }
        );
      }
      
      // Verificar si ya tiene este objetivo
      const currentGoals = person.studyGoals || [];
      if (currentGoals.some(id => typeof id === 'string' ? id === goalId : id.toString() === goalId)) {
        this.logger.warn(`Study goal ${goalId} already associated with person ${peopleId}`);
        throw new BadRequestException(
          'Este objetivo de estudio ya está asociado al perfil',
          'STUDY_GOAL_ALREADY_ASSOCIATED',
          { peopleId, goalId }
        );
      }
      
      // Añadir el objetivo a la persona (como string)
      const updatedGoals = [
        ...currentGoals.map(id => typeof id === 'string' ? id : id.toString()), 
        goalId
      ];
      
      // Actualizar el perfil
      const updatedPerson = await this.peopleRepository.update(peopleId, {
        studyGoals: updatedGoals
      });
      
      if (!updatedPerson) {
        this.logger.error(`Failed to update person ${peopleId} while adding study goal`);
        throw new InternalServerErrorException(
          'No se pudo actualizar el perfil',
          'UPDATE_PROFILE_FAILED'
        );
      }
      
      this.logger.log(`Study goal ${goalId} added to person ${peopleId} successfully`);
      return updatedPerson;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException ||
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      this.logger.error(`Error adding study goal: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al añadir objetivo de estudio',
        'ADD_STUDY_GOAL_ERROR',
        { originalError: error.message, peopleId, goalId }
      );
    }
  }

  async removeStudyGoal(peopleId: string, goalId: string): Promise<IPeople> {
    try {
      this.logger.log(`Removing study goal ${goalId} from person ${peopleId}`);
      
      // Validate ID format for both IDs
      if (!Helper.isValidObjectId(peopleId)) {
        this.logger.warn(`Invalid person ID format: ${peopleId}`);
        throw new BadRequestException(
          'ID de persona inválido',
          'INVALID_PERSON_ID'
        );
      }
      
      if (!Helper.isValidObjectId(goalId)) {
        this.logger.warn(`Invalid study goal ID format: ${goalId}`);
        throw new BadRequestException(
          'ID de objetivo de estudio inválido',
          'INVALID_GOAL_ID'
        );
      }
      
      // Verificar si existe la persona
      const person = await this.peopleRepository.findById(peopleId);
      if (!person) {
        this.logger.warn(`Person with ID ${peopleId} not found`);
        throw new NotFoundException(
          `Persona con ID ${peopleId} no encontrada`,
          'PERSON_NOT_FOUND',
          { peopleId }
        );
      }
      
      // Verificar si tiene este objetivo
      const currentGoals = person.studyGoals || [];
      if (!currentGoals.some(id => typeof id === 'string' ? id === goalId : id.toString() === goalId)) {
        this.logger.warn(`Study goal ${goalId} not associated with person ${peopleId}`);
        throw new BadRequestException(
          'Este objetivo de estudio no está asociado al perfil',
          'STUDY_GOAL_NOT_ASSOCIATED',
          { peopleId, goalId }
        );
      }
      
      // Quitar el objetivo de la persona
      const updatedGoals = currentGoals
        .filter(id => typeof id === 'string' ? id !== goalId : id.toString() !== goalId)
        .map(id => typeof id === 'string' ? id : id.toString());
      
      // Actualizar el perfil
      const updatedPerson = await this.peopleRepository.update(peopleId, {
        studyGoals: updatedGoals
      });
      
      if (!updatedPerson) {
        this.logger.error(`Failed to update person ${peopleId} while removing study goal`);
        throw new InternalServerErrorException(
          'No se pudo actualizar el perfil',
          'UPDATE_PROFILE_FAILED'
        );
      }
      
      this.logger.log(`Study goal ${goalId} removed from person ${peopleId} successfully`);
      return updatedPerson;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException ||
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      this.logger.error(`Error removing study goal: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al eliminar objetivo de estudio',
        'REMOVE_STUDY_GOAL_ERROR',
        { originalError: error.message, peopleId, goalId }
      );
    }
  }
}