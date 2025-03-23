// src/modules/roles/services/role.service.ts
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories/role.repository';
import { PermissionRepository } from '../infra/repositories/permission.repository';
import { CreateRoleDto, UpdateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<IRole[]> {
    return this.roleRepository.findAll(activeOnly);
  }

  async findById(id: string): Promise<IRole> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return role;
  }

  async findByName(name: string): Promise<IRole> {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundException(`Rol con nombre ${name} no encontrado`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<IRole> {
    // Verificar si ya existe un rol con el mismo nombre
    const existingRole = await this.roleRepository.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException(`Ya existe un rol con el nombre ${createRoleDto.name}`);
    }
    
    // Verificar que los permisos existan
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = await this.permissionRepository.findByNames(createRoleDto.permissions);
      
      if (permissions.length !== createRoleDto.permissions.length) {
        const foundPermissionNames = permissions.map(p => p.name);
        const invalidPermissions = createRoleDto.permissions.filter(p => !foundPermissionNames.includes(p));
        
        throw new NotFoundException(`Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`);
      }
    }
    
    return this.roleRepository.create(createRoleDto);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<IRole> {
    // Verificar si el rol existe
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    
    // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const roleWithSameName = await this.roleRepository.findByName(updateRoleDto.name);
      if (roleWithSameName && roleWithSameName._id !== id) {
        throw new ConflictException(`Ya existe otro rol con el nombre ${updateRoleDto.name}`);
      }
    }
    
    // Verificar que los permisos existan
    if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
      const permissions = await this.permissionRepository.findByNames(updateRoleDto.permissions);
      
      if (permissions.length !== updateRoleDto.permissions.length) {
        const foundPermissionNames = permissions.map(p => p.name);
        const invalidPermissions = updateRoleDto.permissions.filter(p => !foundPermissionNames.includes(p));
        
        throw new NotFoundException(`Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`);
      }
    }
    
    const updatedRole = await this.roleRepository.update(id, updateRoleDto);
    if (!updatedRole) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    
    return updatedRole;
  }

  async delete(id: string): Promise<void> {
    const deletedRole = await this.roleRepository.delete(id);
    if (!deletedRole) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
  }

  async addPermission(roleId: string, permissionName: string): Promise<IRole> {
    // Verificar si el permiso existe
    const permission = await this.permissionRepository.findByName(permissionName);
    if (!permission) {
      throw new NotFoundException(`Permiso ${permissionName} no encontrado`);
    }
    
    // Añadir el permiso al rol
    const updatedRole = await this.roleRepository.addPermission(roleId, permissionName);
    if (!updatedRole) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }
    
    return updatedRole;
  }

  async removePermission(roleId: string, permissionName: string): Promise<IRole> {
    // Verificar si el rol existe
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }
    
    // Quitar el permiso
    const updatedRole = await this.roleRepository.removePermission(roleId, permissionName);
    
    // Asegurarse de que el resultado nunca sea null
    if (!updatedRole) {
      // Si por algún motivo no se obtiene un rol actualizado, devolver el rol original
      this.logger.warn(`No se pudo actualizar el rol ${roleId} al remover permiso ${permissionName}`);
      return role;
    }
    
    return updatedRole;
  }
}