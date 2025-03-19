// src/modules/roles/services/user-role.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { UserRoleRepository } from '../infra/repositories/user-role.repository';
import { RoleRepository } from '../infra/repositories/role.repository';
import { AssignRoleDto } from '../infra/model/dto';
import { IUserRole, IRole } from '../infra/model/interfaces';

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async findAll(): Promise<IUserRole[]> {
    return this.userRoleRepository.findAll();
  }

  async findById(id: string): Promise<IUserRole> {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new NotFoundException(`Asignación de rol con ID ${id} no encontrada`);
    }
    return userRole;
  }

  async findByUser(userId: string): Promise<IUserRole[]> {
    return this.userRoleRepository.findByUser(userId);
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<IUserRole> {
    // Verificar si el rol existe
    const role = await this.roleRepository.findById(assignRoleDto.roleId);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${assignRoleDto.roleId} no encontrado`);
    }
    
    try {
      return await this.userRoleRepository.assign(assignRoleDto);
    } catch (error) {
      this.logger.error(`Error al asignar rol: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al asignar rol: ${error.message}`);
    }
  }

  async removeRole(userId: string, roleId: string): Promise<boolean> {
    const result = await this.userRoleRepository.removeRole(userId, roleId);
    if (!result) {
      this.logger.warn(`No se encontró la asignación de rol para usuario ${userId} y rol ${roleId}`);
    }
    return result;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRoleRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Asignación de rol con ID ${id} no encontrada`);
    }
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const userRoles = await this.userRoleRepository.findByRoleName(userId, roleName);
      return userRoles.length > 0;
    } catch (error) {
      this.logger.error(`Error al verificar rol: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene cualquiera de los roles especificados
   */
  async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    for (const roleName of roleNames) {
      if (await this.hasRole(userId, roleName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verifica si un usuario tiene todos los roles especificados
   */
  async hasAllRoles(userId: string, roleNames: string[]): Promise<boolean> {
    for (const roleName of roleNames) {
      if (!(await this.hasRole(userId, roleName))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Obtener todos los roles del usuario
      const userRoles = await this.userRoleRepository.findByUser(userId);
      
      // Verificar si alguno de los roles contiene el permiso
      for (const userRole of userRoles) {
        if (userRole.role && userRole.role.permissions.includes(permission)) {
          return true;
        }
        
        // Si no están populados los permisos, buscar explícitamente
        if (!userRole.role || !userRole.role.permissions) {
          const role = await this.roleRepository.findById(userRole.roleId);
          if (role && role.permissions.includes(permission)) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error al verificar permiso: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verifica si un usuario tiene alguno de los permisos especificados
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }
}