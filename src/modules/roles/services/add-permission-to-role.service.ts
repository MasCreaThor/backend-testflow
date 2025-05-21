// src/modules/roles/services/add-permission-to-role.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { PermissionRepository } from '../infra/repositories';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para agregar un permiso a un rol
 */
@Injectable()
export class AddPermissionToRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(AddPermissionToRoleService.name);
  }

  /**
   * Agrega un permiso a un rol
   * @param roleId ID del rol
   * @param permissionName Nombre del permiso
   * @returns Rol actualizado
   * @throws NotFoundException si el rol o el permiso no existen
   * @throws InternalServerErrorException si ocurre un error
   */
  async execute(roleId: string, permissionName: string): Promise<IRole> {
    try {
      // Verificar si el permiso existe
      this.logger.debug(`Verificando existencia de permiso: ${permissionName}`);
      const permission = await this.permissionRepository.findByName(permissionName);
      
      if (!permission) {
        this.logger.warn(`Permiso ${permissionName} no encontrado`);
        throw new NotFoundException(`Permiso ${permissionName} no encontrado`);
      }
      
      // Agregar el permiso al rol
      this.logger.debug(`Agregando permiso ${permissionName} al rol ${roleId}`);
      const updatedRole = await this.roleRepository.addPermission(roleId, permissionName);
      
      if (!updatedRole) {
        this.logger.warn(`Rol con ID ${roleId} no encontrado`);
        throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
      }
      
      this.logger.log(`Permiso ${permissionName} agregado al rol ${roleId}`);
      return updatedRole;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al agregar permiso al rol: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al agregar permiso al rol');
    }
  }
}