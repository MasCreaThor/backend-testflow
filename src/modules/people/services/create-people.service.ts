// src/modules/people/services/create-people.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { CreatePeopleDto } from '../model/dto';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para crear perfiles de personas
 */
@Injectable()
export class CreatePeopleService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreatePeopleService.name);
  }

  /**
   * Crea un nuevo perfil de persona
   * @param createPeopleDto Datos para la creación
   * @returns Perfil de persona creado
   * @throws BadRequestException si hay objetivos de estudio inválidos
   * @throws InternalServerErrorException si ocurre un error en la creación
   */
  async execute(createPeopleDto: CreatePeopleDto): Promise<IPeople> {
    try {
      // Validar objetivos de estudio si se proporcionan
      if (createPeopleDto.studyGoals && createPeopleDto.studyGoals.length > 0) {
        this.logger.debug(`Validando objetivos de estudio: ${createPeopleDto.studyGoals.join(', ')}`);
        const validGoals = await this.studyGoalRepository.findByIds(createPeopleDto.studyGoals);
        
        if (validGoals.length !== createPeopleDto.studyGoals.length) {
          this.logger.warn('Algunos objetivos de estudio no son válidos');
          throw new BadRequestException('Algunos objetivos de estudio no son válidos');
        }
      }
      
      this.logger.debug(`Creando nuevo perfil de persona para usuario: ${createPeopleDto.userId}`);
      const newPerson = await this.peopleRepository.create(createPeopleDto);
      this.logger.log(`Perfil de persona creado con ID: ${newPerson._id}`);
      
      return newPerson;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al crear perfil de persona: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear el perfil de persona');
    }
  }
}