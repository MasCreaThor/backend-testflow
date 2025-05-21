// src/modules/users/controllers/delete-user.controller.ts
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { DeleteUserService } from '../services';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para la eliminación de usuarios
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class DeleteUserController {
  constructor(
    private readonly deleteUserService: DeleteUserService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeleteUserController.name);
  }

  /**
   * Elimina un usuario existente
   * @param id ID del usuario a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  async handle(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando usuario con ID: ${id}`);
    await this.deleteUserService.execute(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}