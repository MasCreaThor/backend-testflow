import { Injectable, BadRequestException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories/category.repository';
import { PeopleRepository } from '../../people/infra/repositories'; // Añadir esta importación
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

@Injectable()
export class CreateStudyGoalService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly categoryRepository: CategoryRepository,
    @Inject(forwardRef(() => PeopleRepository)) // Usar forwardRef para evitar dependencia circular
    private readonly peopleRepository: PeopleRepository, // Añadir este repositorio
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreateStudyGoalService.name);
  }

  async execute(createStudyGoalDto: CreateStudyGoalDto, userId: string): Promise<IStudyGoal> { // Añadir parámetro userId
    try {
      // Verificar si la categoría existe (si se proporciona)
      if (createStudyGoalDto.categoryId) {
        this.logger.debug(`Verificando existencia de categoría: ${createStudyGoalDto.categoryId}`);
        const category = await this.categoryRepository.findById(createStudyGoalDto.categoryId);
        
        if (!category) {
          this.logger.warn(`La categoría con ID ${createStudyGoalDto.categoryId} no existe`);
          throw new BadRequestException(`La categoría con ID ${createStudyGoalDto.categoryId} no existe`);
        }
      }
      
      // Crear el objetivo de estudio
      this.logger.debug(`Creando nuevo objetivo de estudio: ${createStudyGoalDto.name}`);
      const newGoal = await this.studyGoalRepository.create(createStudyGoalDto);
      this.logger.log(`Objetivo de estudio creado con ID: ${newGoal._id}`);
      
      // Buscar el perfil de persona del usuario
      this.logger.debug(`Buscando perfil de persona para usuario: ${userId}`);
      const personProfile = await this.peopleRepository.findByUserId(userId);
      
      if (!personProfile) {
        this.logger.warn(`No se encontró perfil para el usuario: ${userId}`);
        throw new BadRequestException('No se encontró perfil de usuario');
      }
      
      // Obtener los objetivos actuales y añadir el nuevo
      const currentGoals = personProfile.studyGoals || [];
      const updatedGoals = [...currentGoals, newGoal._id];
      
      // Actualizar el perfil de la persona con el nuevo objetivo
      this.logger.debug(`Actualizando perfil ${personProfile._id} con nuevo objetivo ${newGoal._id}`);
      await this.peopleRepository.update(personProfile._id, {
        studyGoals: updatedGoals as string[]
      });
      
      return newGoal;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error al crear objetivo de estudio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear el objetivo de estudio');
    }
  }
}