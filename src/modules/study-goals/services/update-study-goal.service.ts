// src/modules/study-goals/services/update-study-goal.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories/category.repository';
import { UpdateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para actualizar objetivos de estudio
 */
@Injectable()
export class UpdateStudyGoalService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateStudyGoalService.name);
  }

  /**
   * Actualiza un objetivo de estudio existente
   * @param id ID del objetivo a actualizar
   * @param updateStudyGoalDto Datos para la actualización
   * @returns Objetivo de estudio actualizado
   * @throws NotFoundException si el objetivo no existe
   * @throws BadRequestException si la categoría no existe
   * @throws InternalServerErrorException si ocurre un error en la actualización
   */
  async execute(id: string, updateStudyGoalDto: UpdateStudyGoalDto): Promise<IStudyGoal> {
    try {
      // Verificar si el objetivo existe
      this.logger.debug(`Verificando existencia de objetivo de estudio: ${id}`);
      const existingGoal = await this.studyGoalRepository.findById(id);
      
      if (!existingGoal) {
        this.logger.warn(`Objetivo de estudio con ID ${id} no encontrado`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }

      // Verificar si la categoría existe (si se está actualizando)
      if (updateStudyGoalDto.categoryId) {
        this.logger.debug(`Verificando existencia de categoría: ${updateStudyGoalDto.categoryId}`);
        const category = await this.categoryRepository.findById(updateStudyGoalDto.categoryId);
        
        if (!category) {
          this.logger.warn(`La categoría con ID ${updateStudyGoalDto.categoryId} no existe`);
          throw new BadRequestException(`La categoría con ID ${updateStudyGoalDto.categoryId} no existe`);
        }
      }
      
      // Actualizar objetivo de estudio
      this.logger.debug(`Actualizando objetivo de estudio: ${id}`);
      const updatedGoal = await this.studyGoalRepository.update(id, updateStudyGoalDto);
      
      if (!updatedGoal) {
        this.logger.warn(`No se pudo actualizar el objetivo de estudio con ID ${id}`);
        throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Objetivo de estudio actualizado: ${id}`);
      return updatedGoal;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al actualizar objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar el objetivo de estudio');
    }
  }
}