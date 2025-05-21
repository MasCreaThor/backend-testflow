// src/modules/users/services/delete-user.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories/user.repository';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para la eliminación de usuarios
 */
@Injectable()
export class DeleteUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeleteUserService.name);
  }

  /**
   * Elimina un usuario existente
   * @param id ID del usuario a eliminar
   * @throws NotFoundException si el usuario no existe
   * @throws InternalServerErrorException si ocurre un error al procesar la solicitud
   */
  async execute(id: string): Promise<void> {
    this.logger.debug(`Ejecutando eliminación de usuario ID: ${id}`);
    
    try {
      // Verificar si el usuario existe
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      // Eliminar usuario
      const deletedUser = await this.userRepository.delete(id);
      if (!deletedUser) {
        this.logger.warn(`No se pudo eliminar el usuario con ID ${id}`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}