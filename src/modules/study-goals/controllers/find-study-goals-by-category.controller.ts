// src/modules/study-goals/controllers/find-study-goals-by-category.controller.ts
import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FindStudyGoalsByCategoryService } from '../services';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener objetivos de estudio por categoría
 */
@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class FindStudyGoalsByCategoryController {
  constructor(
    private readonly findStudyGoalsByCategoryService: FindStudyGoalsByCategoryService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindStudyGoalsByCategoryController.name);
  }

  /**
   * Obtiene objetivos de estudio por categoría
   * @param categoryId ID de la categoría
   * @returns Lista de objetivos de estudio de la categoría
   */
  @Get('category/:categoryId')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('categoryId') categoryId: string): Promise<IStudyGoal[]> {
    this.logger.log(`Obteniendo objetivos de estudio para categoría: ${categoryId}`);
    return this.findStudyGoalsByCategoryService.execute(categoryId);
  }
}