// src/modules/people/services/update-people.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { UpdatePeopleDto } from '../model/dto';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para actualizar perfiles de personas
 */
@Injectable()
export class UpdatePeopleService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdatePeopleService.name);
  }

  /**
   * Actualiza un perfil de persona existente
   * @param id ID del perfil a actualizar
   * @param updatePeopleDto Datos para la actualización
   * @returns Perfil de persona actualizado
   * @throws NotFoundException si el perfil no existe
   * @throws BadRequestException si hay objetivos de estudio inválidos
   * @throws InternalServerErrorException si ocurre un error en la actualización
   */
  async execute(id: string, updatePeopleDto: UpdatePeopleDto): Promise<IPeople> {
    try {
      // Verificar si el perfil existe
      this.logger.debug(`Verificando existencia de perfil de persona: ${id}`);
      const existingPerson = await this.peopleRepository.findById(id);
      
      if (!existingPerson) {
        this.logger.warn(`Perfil de persona con ID ${id} no encontrado`);
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }

      // Validar objetivos de estudio si se proporcionan
      if (updatePeopleDto.studyGoals && updatePeopleDto.studyGoals.length > 0) {
        this.logger.debug(`Validando objetivos de estudio: ${updatePeopleDto.studyGoals.join(', ')}`);
        const validGoals = await this.studyGoalRepository.findByIds(updatePeopleDto.studyGoals);
        
        if (validGoals.length !== updatePeopleDto.studyGoals.length) {
          this.logger.warn('Algunos objetivos de estudio no son válidos');
          throw new BadRequestException('Algunos objetivos de estudio no son válidos');
        }
      }
      
      // Actualizar perfil
      this.logger.debug(`Actualizando perfil de persona: ${id}`);
      const updatedPerson = await this.peopleRepository.update(id, updatePeopleDto);
      
      if (!updatedPerson) {
        this.logger.warn(`No se pudo actualizar el perfil de persona con ID ${id}`);
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }
      
      this.logger.log(`Perfil de persona actualizado: ${id}`);
      return updatedPerson;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al actualizar perfil de persona: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar el perfil de persona');
    }
  }
}