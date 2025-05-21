// src/modules/study-goals/services/find-study-goal-by-id.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener un objetivo de estudio por su ID
 */
@Injectable()
export class FindStudyGoalByIdService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindStudyGoalByIdService.name);
  }

  /**
   * Obtiene un objetivo de estudio por su ID
   * @param id ID del objetivo de estudio
   * @returns Objetivo de estudio encontrado
   * @throws NotFoundException si el objetivo no existe
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(id: string): Promise<IStudyGoal> {
    try {
      this.logger.debug(`Buscando objetivo de estudio con ID: ${id}`);
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
      throw new InternalServerErrorException('Error al buscar el objetivo de estudio');
    }
  }
}