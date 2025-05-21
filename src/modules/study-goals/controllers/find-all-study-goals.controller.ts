// src/modules/study-goals/controllers/find-all-study-goals.controller.ts
import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FindAllStudyGoalsService } from '../services';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener todos los objetivos de estudio
 */
@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class FindAllStudyGoalsController {
  constructor(
    private readonly findAllStudyGoalsService: FindAllStudyGoalsService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindAllStudyGoalsController.name);
  }

  /**
   * Obtiene todos los objetivos de estudio
   * @param activeOnly Filtrar solo objetivos activos
   * @returns Lista de objetivos de estudio
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async handle(@Query('activeOnly') activeOnly: boolean = false): Promise<IStudyGoal[]> {
    this.logger.log(`Obteniendo todos los objetivos de estudio. activeOnly=${activeOnly}`);
    return this.findAllStudyGoalsService.execute(activeOnly);
  }
}