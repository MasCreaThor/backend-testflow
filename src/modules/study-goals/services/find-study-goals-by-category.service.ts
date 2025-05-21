// src/modules/study-goals/services/find-study-goals-by-category.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories/category.repository';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener objetivos de estudio por categoría
 */
@Injectable()
export class FindStudyGoalsByCategoryService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindStudyGoalsByCategoryService.name);
  }

  /**
   * Obtiene objetivos de estudio por categoría
   * @param categoryId ID de la categoría
   * @returns Lista de objetivos de estudio de la categoría
   * @throws NotFoundException si la categoría no existe
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(categoryId: string): Promise<IStudyGoal[]> {
    try {
      this.logger.debug(`Verificando existencia de categoría: ${categoryId}`);
      const category = await this.categoryRepository.findById(categoryId);
      
      if (!category) {
        this.logger.warn(`Categoría con ID ${categoryId} no encontrada`);
        throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
      }

      this.logger.debug(`Buscando objetivos de estudio para categoría: ${categoryId}`);
      const goals = await this.studyGoalRepository.findByCategory(categoryId);
      this.logger.debug(`Encontrados ${goals.length} objetivos de estudio para la categoría ${categoryId}`);
      
      return goals;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar objetivos por categoría: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar objetivos por categoría');
    }
  }
}