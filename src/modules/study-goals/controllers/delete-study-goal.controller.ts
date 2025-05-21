// src/modules/study-goals/controllers/delete-study-goal.controller.ts
import { Controller, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { DeleteStudyGoalService } from '../services';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para eliminar objetivos de estudio
 */
@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class DeleteStudyGoalController {
  constructor(
    private readonly deleteStudyGoalService: DeleteStudyGoalService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeleteStudyGoalController.name);
  }

  /**
   * Elimina un objetivo de estudio existente
   * @param id ID del objetivo a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando objetivo de estudio con ID: ${id}`);
    await this.deleteStudyGoalService.execute(id);
    return { message: 'Objetivo de estudio eliminado con éxito' };
  }
}
