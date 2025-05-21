// src/modules/people/controllers/study-goals-profile.controller.ts
import { Controller, Post, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { StudyGoalsProfileService } from '../services';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para gestionar objetivos de estudio en perfiles de personas
 */
@Controller('people/:peopleId/study-goals')
@UseGuards(JwtAuthGuard)
export class StudyGoalsProfileController {
  constructor(
    private readonly studyGoalsProfileService: StudyGoalsProfileService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(StudyGoalsProfileController.name);
  }

  /**
   * Agrega un objetivo de estudio al perfil de una persona
   * @param peopleId ID del perfil de persona
   * @param goalId ID del objetivo de estudio
   * @returns Perfil de persona actualizado
   */
  @Post(':goalId')
  @HttpCode(HttpStatus.OK)
  async addStudyGoal(
    @Param('peopleId') peopleId: string,
    @Param('goalId') goalId: string
  ): Promise<IPeople> {
    this.logger.log(`Agregando objetivo de estudio ${goalId} al perfil ${peopleId}`);
    return this.studyGoalsProfileService.addStudyGoal(peopleId, goalId);
  }

  /**
   * Elimina un objetivo de estudio del perfil de una persona
   * @param peopleId ID del perfil de persona
   * @param goalId ID del objetivo de estudio
   * @returns Perfil de persona actualizado
   */
  @Delete(':goalId')
  @HttpCode(HttpStatus.OK)
  async removeStudyGoal(
    @Param('peopleId') peopleId: string,
    @Param('goalId') goalId: string
  ): Promise<IPeople> {
    this.logger.log(`Eliminando objetivo de estudio ${goalId} del perfil ${peopleId}`);
    return this.studyGoalsProfileService.removeStudyGoal(peopleId, goalId);
  }
}