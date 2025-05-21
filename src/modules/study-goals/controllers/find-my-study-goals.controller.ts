import { Controller, Get, Query, Request, UseGuards, HttpCode, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { StudyGoalRepository } from '../infra/repositories';
import { PeopleRepository } from '../../people/infra/repositories';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

@Controller('study-goals') // Mantenemos el prefijo base
@UseGuards(JwtAuthGuard)
export class FindMyStudyGoalsController {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    @Inject(forwardRef(() => PeopleRepository))
    private readonly peopleRepository: PeopleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindMyStudyGoalsController.name);
  }

  // Cambiamos la ruta a /user/goals para evitar conflictos
  @Get('user/goals')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Request() req,
    @Query('activeOnly') activeOnly: boolean = false
  ): Promise<IStudyGoal[]> {
    // Obtener el ID del usuario de la sesión
    const userId = req.user._id;
    
    this.logger.log(`Obteniendo objetivos de estudio para usuario ${userId}. activeOnly=${activeOnly}`);
    
    // Buscar el perfil de persona del usuario
    const personProfile = await this.peopleRepository.findByUserId(userId);
    
    if (!personProfile || !personProfile.studyGoals || personProfile.studyGoals.length === 0) {
      // Si el usuario no tiene perfil o no tiene objetivos, devolver lista vacía
      this.logger.debug(`No se encontraron objetivos para el usuario: ${userId}`);
      return [];
    }
    
    // Obtener los IDs de objetivos del perfil
    const studyGoalIds = personProfile.studyGoals.map(id => 
      typeof id === 'string' ? id : id.toString()
    );
    
    // Buscar los objetivos correspondientes
    const goals = await this.studyGoalRepository.findByIds(studyGoalIds);
    
    // Aplicar filtro activo si es necesario
    const filteredGoals = activeOnly 
      ? goals.filter(goal => goal.isActive)
      : goals;
    
    this.logger.debug(`Encontrados ${filteredGoals.length} objetivos para el usuario ${userId}`);
    
    return filteredGoals;
  }
}