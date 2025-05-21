// src/modules/study-goals/controllers/update-study-goal.controller.ts
import { Controller, Put, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UpdateStudyGoalService } from '../services';
import { UpdateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para actualizar objetivos de estudio
 */
@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class UpdateStudyGoalController {
  constructor(
    private readonly updateStudyGoalService: UpdateStudyGoalService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateStudyGoalController.name);
  }

  /**
   * Actualiza un objetivo de estudio existente
   * @param id ID del objetivo a actualizar
   * @param updateStudyGoalDto Datos para la actualización
   * @returns Objetivo de estudio actualizado
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Param('id') id: string,
    @Body() updateStudyGoalDto: UpdateStudyGoalDto
  ): Promise<IStudyGoal> {
    this.logger.log(`Actualizando objetivo de estudio ${id}`);
    return this.updateStudyGoalService.execute(id, updateStudyGoalDto);
  }
}