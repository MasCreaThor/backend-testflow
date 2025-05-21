// src/modules/users/controllers/update-user.controller.ts
import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UpdateUserService } from '../services';
import { UpdateUserDto } from '../model/dto';
import { IUser } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para la actualización de usuarios
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UpdateUserController {
  constructor(
    private readonly updateUserService: UpdateUserService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateUserController.name);
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param updateUserDto Datos para actualizar el usuario
   * @returns Usuario actualizado
   */
  @Put(':id')
  async handle(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<Omit<IUser, 'password'>> {
    this.logger.log(`Actualizando usuario con ID: ${id}`);
    return this.updateUserService.execute(id, updateUserDto);
  }
}