// src/modules/study-goals/services/delete-study-goal.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para eliminar objetivos de estudio
 */
@Injectable()
export class DeleteStudyGoalService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeleteStudyGoalService.name);
  }

  /**
   * Elimina un objetivo de estudio existente
   * @param id ID del objetivo a eliminar
   * @throws NotFoundException si el objetivo no existe
   * @throws InternalServerErrorException si ocurre un error en la eliminación
   */
  async execute(id: string): Promise<void> {
    try {
      this.logger.debug(`Verificando existencia de objetivo de estudio: ${id}`);
      const existingGoal = await this.studyGoalRepository.findById(id);
      
      if (!existingGoal) {
        this.logger.warn(`Objetivo de estudio con ID ${id} no encontrado`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }

      this.logger.debug(`Eliminando objetivo de estudio: ${id}`);
      const deletedGoal = await this.studyGoalRepository.delete(id);
      
      if (!deletedGoal) {
        this.logger.warn(`No se pudo eliminar el objetivo de estudio con ID ${id}`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Objetivo de estudio eliminado: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar el objetivo de estudio');
    }
  }
}