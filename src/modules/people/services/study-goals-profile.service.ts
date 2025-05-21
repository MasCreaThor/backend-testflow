// src/modules/people/services/study-goals-profile.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para gestionar objetivos de estudio en perfiles de personas
 */
@Injectable()
export class StudyGoalsProfileService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(StudyGoalsProfileService.name);
  }

  /**
   * Agrega un objetivo de estudio al perfil de una persona
   * @param peopleId ID del perfil de persona
   * @param goalId ID del objetivo de estudio
   * @returns Perfil de persona actualizado
   * @throws NotFoundException si el perfil o el objetivo no existen
   * @throws BadRequestException si el objetivo ya está asociado al perfil
   * @throws InternalServerErrorException si ocurre un error
   */
  async addStudyGoal(peopleId: string, goalId: string): Promise<IPeople> {
    try {
      // Verificar si existe la persona
      this.logger.debug(`Verificando existencia de perfil de persona: ${peopleId}`);
      const person = await this.peopleRepository.findById(peopleId);
      
      if (!person) {
        this.logger.warn(`Perfil de persona con ID ${peopleId} no encontrado`);
        throw new NotFoundException(`Persona con ID ${peopleId} no encontrada`);
      }
      
      // Verificar si existe el objetivo
      this.logger.debug(`Verificando existencia de objetivo de estudio: ${goalId}`);
      const goal = await this.studyGoalRepository.findById(goalId);
      
      if (!goal) {
        this.logger.warn(`Objetivo de estudio con ID ${goalId} no encontrado`);
        throw new NotFoundException(`Objetivo de estudio con ID ${goalId} no encontrado`);
      }
      
      // Verificar si ya tiene este objetivo
      const currentGoals = person.studyGoals || [];
      if (currentGoals.some(id => typeof id === 'string' ? id === goalId : id.toString() === goalId)) {
        this.logger.warn(`El objetivo de estudio ${goalId} ya está asociado al perfil ${peopleId}`);
        throw new BadRequestException('Este objetivo de estudio ya está asociado al perfil');
      }
      
      // Añadir el objetivo a la persona (como string)
      const updatedGoals = [...currentGoals.map(id => typeof id === 'string' ? id : id.toString()), goalId];
      
      // Actualizar el perfil
      this.logger.debug(`Actualizando perfil ${peopleId} con nuevo objetivo ${goalId}`);
      const updatedPerson = await this.peopleRepository.update(peopleId, {
        studyGoals: updatedGoals
      });
      
      if (!updatedPerson) {
        this.logger.warn(`No se pudo actualizar el perfil de persona con ID ${peopleId}`);
        throw new BadRequestException('No se pudo actualizar el perfil');
      }
      
      this.logger.log(`Objetivo ${goalId} agregado exitosamente al perfil ${peopleId}`);
      return updatedPerson;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al agregar objetivo al perfil: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al agregar objetivo al perfil');
    }
  }

  /**
   * Elimina un objetivo de estudio del perfil de una persona
   * @param peopleId ID del perfil de persona
   * @param goalId ID del objetivo de estudio
   * @returns Perfil de persona actualizado
   * @throws NotFoundException si el perfil no existe
   * @throws BadRequestException si el objetivo no está asociado al perfil
   * @throws InternalServerErrorException si ocurre un error
   */
  async removeStudyGoal(peopleId: string, goalId: string): Promise<IPeople> {
    try {
      // Verificar si existe la persona
      this.logger.debug(`Verificando existencia de perfil de persona: ${peopleId}`);
      const person = await this.peopleRepository.findById(peopleId);
      
      if (!person) {
        this.logger.warn(`Perfil de persona con ID ${peopleId} no encontrado`);
        throw new NotFoundException(`Persona con ID ${peopleId} no encontrada`);
      }
      
      // Verificar si tiene este objetivo
      const currentGoals = person.studyGoals || [];
      if (!currentGoals.some(id => typeof id === 'string' ? id === goalId : id.toString() === goalId)) {
        this.logger.warn(`El objetivo de estudio ${goalId} no está asociado al perfil ${peopleId}`);
        throw new BadRequestException('Este objetivo de estudio no está asociado al perfil');
      }
      
      // Quitar el objetivo de la persona
      const updatedGoals = currentGoals
        .filter(id => typeof id === 'string' ? id !== goalId : id.toString() !== goalId)
        .map(id => typeof id === 'string' ? id : id.toString());
      
      // Actualizar el perfil
      this.logger.debug(`Actualizando perfil ${peopleId} para eliminar objetivo ${goalId}`);
      const updatedPerson = await this.peopleRepository.update(peopleId, {
        studyGoals: updatedGoals
      });
      
      if (!updatedPerson) {
        this.logger.warn(`No se pudo actualizar el perfil de persona con ID ${peopleId}`);
        throw new BadRequestException('No se pudo actualizar el perfil');
      }
      
      this.logger.log(`Objetivo ${goalId} eliminado exitosamente del perfil ${peopleId}`);
      return updatedPerson;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar objetivo del perfil: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar objetivo del perfil');
    }
  }
}