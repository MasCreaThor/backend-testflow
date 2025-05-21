// src/modules/study-goals/controllers/find-study-goal-by-id.controller.ts
import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FindStudyGoalByIdService } from '../services';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener un objetivo de estudio por su ID
 */
@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class FindStudyGoalByIdController {
  constructor(
    private readonly findStudyGoalByIdService: FindStudyGoalByIdService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindStudyGoalByIdController.name);
  }

  /**
   * Obtiene un objetivo de estudio por su ID
   * @param id ID del objetivo de estudio
   * @returns Objetivo de estudio encontrado
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<IStudyGoal> {
    this.logger.log(`Obteniendo objetivo de estudio con ID: ${id}`);
    return this.findStudyGoalByIdService.execute(id);
  }
}