// src/modules/roles/services/remove-permission-from-role.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para eliminar un permiso de un rol
 */
@Injectable()
export class RemovePermissionFromRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(RemovePermissionFromRoleService.name);
  }

  /**
   * Elimina un permiso de un rol
   * @param roleId ID del rol
   * @param permissionName Nombre del permiso
   * @returns Rol actualizado
   * @throws NotFoundException si el rol no existe
   * @throws InternalServerErrorException si ocurre un error
   */
  async execute(roleId: string, permissionName: string): Promise<IRole> {
    try {
      // Verificar si el rol existe
      this.logger.debug(`Verificando existencia de rol: ${roleId}`);
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        this.logger.warn(`Rol con ID ${roleId} no encontrado`);
        throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
      }
      
      // Eliminar el permiso del rol
      this.logger.debug(`Eliminando permiso ${permissionName} del rol ${roleId}`);
      const updatedRole = await this.roleRepository.removePermission(roleId, permissionName);
      
      // El método removePermission puede devolver null si no se encuentra el rol
      if (!updatedRole) {
        this.logger.warn(`No se pudo eliminar el permiso ${permissionName} del rol ${roleId}`);
        // Devolver el rol original, siguiendo la lógica del método original
        return role;
      }
      
      this.logger.log(`Permiso ${permissionName} eliminado del rol ${roleId}`);
      return updatedRole;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar permiso del rol: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar permiso del rol');
    }
  }
}