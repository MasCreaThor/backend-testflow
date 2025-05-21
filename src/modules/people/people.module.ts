// src/modules/people/people.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { People, PeopleSchema } from './infra/schemas';
import {
  FindAllPeopleController,
  FindPeopleByIdController,
  FindPeopleByUserIdController,
  CreatePeopleController,
  UpdatePeopleController,
  DeletePeopleController,
  StudyGoalsProfileController
} from './controllers';
import {
  FindAllPeopleService,
  FindPeopleByIdService,
  FindPeopleByUserIdService,
  CreatePeopleService,
  UpdatePeopleService,
  DeletePeopleService,
  StudyGoalsProfileService
} from './services';
import { PeopleRepository } from './infra/repositories';
import { StudyGoalsModule } from '../study-goals/study-goals.module';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * Módulo para la gestión de perfiles de personas
 * 
 * Proporciona funcionalidad para crear, leer, actualizar y eliminar
 * perfiles de personas, así como gestionar sus objetivos de estudio.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: People.name, schema: PeopleSchema }]),
    forwardRef(() => StudyGoalsModule),
  ],
  controllers: [
    FindAllPeopleController,
    FindPeopleByIdController,
    FindPeopleByUserIdController,
    CreatePeopleController,
    UpdatePeopleController,
    DeletePeopleController,
    StudyGoalsProfileController
  ],
  providers: [
    LoggerService,
    PeopleRepository,
    FindAllPeopleService,
    FindPeopleByIdService,
    FindPeopleByUserIdService,
    CreatePeopleService,
    UpdatePeopleService,
    DeletePeopleService,
    StudyGoalsProfileService
  ],
  exports: [
    // Exportar servicios específicos que otros módulos necesitan
    FindPeopleByIdService,
    FindPeopleByUserIdService,
    CreatePeopleService,
    UpdatePeopleService,
    // También exportar el repositorio si se usa directamente
    PeopleRepository,
  ],
})
export class PeopleModule {}