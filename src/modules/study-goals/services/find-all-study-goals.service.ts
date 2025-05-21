// src/modules/study-goals/services/find-all-study-goals.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener todos los objetivos de estudio
 */
@Injectable()
export class FindAllStudyGoalsService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindAllStudyGoalsService.name);
  }

  /**
   * Obtiene todos los objetivos de estudio
   * @param activeOnly Filtrar solo objetivos activos
   * @returns Lista de objetivos de estudio
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    try {
      this.logger.debug(`Buscando todos los objetivos de estudio. activeOnly=${activeOnly}`);
      const goals = await this.studyGoalRepository.findAll(activeOnly);
      this.logger.debug(`Encontrados ${goals.length} objetivos de estudio`);
      return goals;
    } catch (error) {
      this.logger.error(`Error al buscar todos los objetivos de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener los objetivos de estudio');
    }
  }
}