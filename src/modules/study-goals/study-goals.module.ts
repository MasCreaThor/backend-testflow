// src/modules/study-goals/study-goals.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyGoal, StudyGoalSchema } from './infra/schemas';
import {
  
  FindAllStudyGoalsController,
  FindStudyGoalByIdController,
  FindStudyGoalsByCategoryController,
  CreateStudyGoalController,
  UpdateStudyGoalController,
  DeleteStudyGoalController,
  FindMyStudyGoalsController
} from './controllers';
import {
 
  FindAllStudyGoalsService,
  FindStudyGoalByIdService,
  FindStudyGoalsByCategoryService,
  CreateStudyGoalService,
  UpdateStudyGoalService,
  DeleteStudyGoalService
} from './services';
import { StudyGoalRepository } from './infra/repositories';
import { CategoriesModule } from '../categories/categories.module';
import { LoggerService } from '../../shared/services/logger.service';
import { PeopleModule } from '../people/people.module';

/**
 * Módulo para la gestión de objetivos de estudio
 * 
 * Proporciona funcionalidad para crear, leer, actualizar y eliminar
 * objetivos de estudio, así como buscarlos por categoría.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudyGoal.name, schema: StudyGoalSchema }]),
    CategoriesModule,
    forwardRef(() => PeopleModule),
  ],
  controllers: [
      // Controller general (legacy support)
    FindAllStudyGoalsController,
    FindStudyGoalByIdController,
    FindStudyGoalsByCategoryController,
    CreateStudyGoalController,
    UpdateStudyGoalController,
    DeleteStudyGoalController,
    FindMyStudyGoalsController
  ],
  providers: [
    LoggerService,
    StudyGoalRepository,
      // Servicio general (legacy support)
    FindAllStudyGoalsService,
    FindStudyGoalByIdService,
    FindStudyGoalsByCategoryService,
    CreateStudyGoalService,
    UpdateStudyGoalService,
    DeleteStudyGoalService
  ],
  exports: [
 
    StudyGoalRepository,
    FindAllStudyGoalsService,
    FindStudyGoalByIdService,
    FindStudyGoalsByCategoryService
  ],
})
export class StudyGoalsModule {}