// src/modules/users/controllers/create-user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserService } from '../services';
import { CreateUserDto } from '../model/dto';
import { IUser } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para la creación de usuarios
 */
@Controller('users')
export class CreateUserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreateUserController.name);
  }

  /**
   * Crea un nuevo usuario
   * @param createUserDto Datos para la creación del usuario
   * @returns Usuario creado sin la contraseña
   */
  @Post()
  async handle(@Body() createUserDto: CreateUserDto): Promise<Omit<IUser, 'password'>> {
    this.logger.log(`Creando usuario con email: ${createUserDto.email}`);
    return this.createUserService.execute(createUserDto);
  }
}