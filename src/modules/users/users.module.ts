// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './infra/schemas';
import { 
  CreateUserController,
  FindAllUsersController,
  FindUserByIdController,
  UpdateUserController,
  DeleteUserController,
  TestConnectionController,
} from './controllers';

import {
  CreateUserService,
  FindAllUsersService,
  FindUserByIdService,
  UpdateUserService,
  DeleteUserService,
  TestConnectionService,
  UpdateLastLoginService,
} from './services';

import { UserRepository } from './infra/repositories';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * Módulo de usuarios que maneja todas las operaciones relacionadas con usuarios
 * 
 * Este módulo proporciona funcionalidad para crear, leer, actualizar y eliminar usuarios,
 * así como servicios específicos como actualización de último login y pruebas de conexión.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [
    CreateUserController,
    FindAllUsersController,
    FindUserByIdController,
    UpdateUserController,
    DeleteUserController,
    TestConnectionController,
  ],
  providers: [
    LoggerService,
    UserRepository,
    CreateUserService,
    FindAllUsersService,
    FindUserByIdService,
    UpdateUserService,
    DeleteUserService,
    TestConnectionService,
    UpdateLastLoginService,
  ],
  exports: [
    UserRepository,
    CreateUserService,
    FindAllUsersService,
    FindUserByIdService,
    UpdateUserService,
    DeleteUserService,
    UpdateLastLoginService,
  ],
})
export class UsersModule {}