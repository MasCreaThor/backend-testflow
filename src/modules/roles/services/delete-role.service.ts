// src/modules/roles/services/delete-role.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para eliminar roles
 */
@Injectable()
export class DeleteRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeleteRoleService.name);
  }

  /**
   * Elimina un rol existente
   * @param id ID del rol a eliminar
   * @throws NotFoundException si el rol no existe
   * @throws InternalServerErrorException si ocurre un error en la eliminación
   */
  async execute(id: string): Promise<void> {
    try {
      this.logger.debug(`Verificando existencia de rol con ID: ${id}`);
      const existingRole = await this.roleRepository.findById(id);
      
      if (!existingRole) {
        this.logger.warn(`Rol con ID ${id} no encontrado`);
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      this.logger.debug(`Eliminando rol con ID: ${id}`);
      const deletedRole = await this.roleRepository.delete(id);
      
      if (!deletedRole) {
        this.logger.warn(`No se pudo eliminar el rol con ID ${id}`);
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Rol eliminado con ID: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar rol: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar el rol');
    }
  }
}