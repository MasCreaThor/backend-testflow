// src/modules/roles/services/update-role.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { PermissionRepository } from '../infra/repositories';
import { UpdateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para actualizar roles
 */
@Injectable()
export class UpdateRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateRoleService.name);
  }

  /**
   * Actualiza un rol existente
   * @param id ID del rol a actualizar
   * @param updateRoleDto Datos para la actualización
   * @returns Rol actualizado
   * @throws NotFoundException si el rol no existe
   * @throws ConflictException si el nuevo nombre ya está en uso
   * @throws NotFoundException si alguno de los permisos no existe
   * @throws InternalServerErrorException si ocurre un error en la actualización
   */
  async execute(id: string, updateRoleDto: UpdateRoleDto): Promise<IRole> {
    try {
      // Verificar si el rol existe
      this.logger.debug(`Verificando existencia de rol con ID: ${id}`);
      const existingRole = await this.roleRepository.findById(id);
      
      if (!existingRole) {
        this.logger.warn(`Rol con ID ${id} no encontrado`);
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      // Verificar que el nuevo nombre no esté en uso por otro rol
      if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
        this.logger.debug(`Verificando si existe otro rol con nombre: ${updateRoleDto.name}`);
        const roleWithSameName = await this.roleRepository.findByName(updateRoleDto.name);
        
        if (roleWithSameName && roleWithSameName._id !== id) {
          this.logger.warn(`Ya existe otro rol con el nombre ${updateRoleDto.name}`);
          throw new ConflictException(`Ya existe otro rol con el nombre ${updateRoleDto.name}`);
        }
      }

      // Verificar que los permisos existan
      if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
        this.logger.debug(`Verificando existencia de permisos: ${updateRoleDto.permissions.join(', ')}`);
        const permissions = await this.permissionRepository.findByNames(updateRoleDto.permissions);
        
        if (permissions.length !== updateRoleDto.permissions.length) {
          const foundPermissionNames = permissions.map(p => p.name);
          const invalidPermissions = updateRoleDto.permissions.filter(p => !foundPermissionNames.includes(p));
          
          this.logger.warn(`Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`);
          throw new NotFoundException(`Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`);
        }
      }
      
      // Actualizar rol
      this.logger.debug(`Actualizando rol con ID: ${id}`);
      const updatedRole = await this.roleRepository.update(id, updateRoleDto);
      
      if (!updatedRole) {
        this.logger.warn(`No se pudo actualizar el rol con ID ${id}`);
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Rol actualizado con ID: ${id}`);
      return updatedRole;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error al actualizar rol: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar el rol');
    }
  }
}