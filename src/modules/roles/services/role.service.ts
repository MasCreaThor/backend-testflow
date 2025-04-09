// src/modules/roles/services/role.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories/role.repository';
import { PermissionRepository } from '../infra/repositories/permission.repository';
import { CreateRoleDto, UpdateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';
import { 
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';
import { Helper } from '../../../common/utils';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<IRole[]> {
    try {
      this.logger.debug(`Finding all roles with activeOnly=${activeOnly}`);
      const roles = await this.roleRepository.findAll(activeOnly);
      this.logger.debug(`Found ${roles.length} roles`);
      return roles;
    } catch (error) {
      this.logger.error(`Error finding all roles: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al obtener roles',
        'FIND_ALL_ROLES_ERROR',
        { originalError: error.message }
      );
    }
  }

  async findById(id: string): Promise<IRole> {
    try {
      this.logger.debug(`Finding role by ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid role ID format: ${id}`);
        throw new BadRequestException(
          'ID de rol inválido',
          'INVALID_ROLE_ID'
        );
      }
      
      const role = await this.roleRepository.findById(id);
      if (!role) {
        this.logger.warn(`Role with ID ${id} not found`);
        throw new NotFoundException(
          `Rol con ID ${id} no encontrado`,
          'ROLE_NOT_FOUND',
          { roleId: id }
        );
      }
      
      this.logger.debug(`Role found: ${role.name}`);
      return role;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding role by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al buscar el rol',
        'FIND_ROLE_ERROR',
        { originalError: error.message, roleId: id }
      );
    }
  }

  async findByName(name: string): Promise<IRole> {
    try {
      this.logger.debug(`Finding role by name: ${name}`);
      
      if (!name || name.trim() === '') {
        this.logger.warn('Empty role name provided');
        throw new BadRequestException(
          'El nombre del rol no puede estar vacío',
          'EMPTY_ROLE_NAME'
        );
      }
      
      const role = await this.roleRepository.findByName(name);
      if (!role) {
        this.logger.warn(`Role with name ${name} not found`);
        throw new NotFoundException(
          `Rol con nombre ${name} no encontrado`,
          'ROLE_NAME_NOT_FOUND',
          { roleName: name }
        );
      }
      
      this.logger.debug(`Role found with name: ${name}`);
      return role;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding role by name: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al buscar el rol por nombre',
        'FIND_ROLE_BY_NAME_ERROR',
        { originalError: error.message, roleName: name }
      );
    }
  }

  async create(createRoleDto: CreateRoleDto): Promise<IRole> {
    try {
      this.logger.log(`Creating new role: ${createRoleDto.name}`);
      
      // Verificar si ya existe un rol con el mismo nombre
      const existingRole = await this.roleRepository.findByName(createRoleDto.name);
      if (existingRole) {
        this.logger.warn(`Role with name ${createRoleDto.name} already exists`);
        throw new ConflictException(
          `Ya existe un rol con el nombre ${createRoleDto.name}`,
          'ROLE_NAME_ALREADY_EXISTS',
          { roleName: createRoleDto.name }
        );
      }
      
      // Verificar que los permisos existan
      if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
        this.logger.debug(`Validating ${createRoleDto.permissions.length} permissions`);
        
        const permissions = await this.permissionRepository.findByNames(createRoleDto.permissions);
        
        if (permissions.length !== createRoleDto.permissions.length) {
          const foundPermissionNames = permissions.map(p => p.name);
          const invalidPermissions = createRoleDto.permissions.filter(p => !foundPermissionNames.includes(p));
          
          this.logger.warn(`Some permissions not found: ${invalidPermissions.join(', ')}`);
          throw new NotFoundException(
            `Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`,
            'PERMISSIONS_NOT_FOUND',
            { invalidPermissions }
          );
        }
      }
      
      const newRole = await this.roleRepository.create(createRoleDto);
      this.logger.log(`Role created successfully with ID: ${newRole._id}`);
      return newRole;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof ConflictException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error creating role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al crear el rol',
        'CREATE_ROLE_ERROR',
        { originalError: error.message }
      );
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<IRole> {
    try {
      this.logger.log(`Updating role with ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid role ID format: ${id}`);
        throw new BadRequestException(
          'ID de rol inválido',
          'INVALID_ROLE_ID'
        );
      }
      
      // Verificar si el rol existe
      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
        this.logger.warn(`Role with ID ${id} not found for update`);
        throw new NotFoundException(
          `Rol con ID ${id} no encontrado`,
          'ROLE_NOT_FOUND',
          { roleId: id }
        );
      }
      
      // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
      if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
        this.logger.debug(`Checking if name "${updateRoleDto.name}" is available`);
        
        const roleWithSameName = await this.roleRepository.findByName(updateRoleDto.name);
        if (roleWithSameName && roleWithSameName._id !== id) {
          this.logger.warn(`Another role with name ${updateRoleDto.name} already exists`);
          throw new ConflictException(
            `Ya existe otro rol con el nombre ${updateRoleDto.name}`,
            'ROLE_NAME_ALREADY_EXISTS',
            { roleName: updateRoleDto.name, existingRoleId: roleWithSameName._id }
          );
        }
      }
      
      // Verificar que los permisos existan
      if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
        this.logger.debug(`Validating ${updateRoleDto.permissions.length} permissions for update`);
        
        const permissions = await this.permissionRepository.findByNames(updateRoleDto.permissions);
        
        if (permissions.length !== updateRoleDto.permissions.length) {
          const foundPermissionNames = permissions.map(p => p.name);
          const invalidPermissions = updateRoleDto.permissions.filter(p => !foundPermissionNames.includes(p));
          
          this.logger.warn(`Some permissions not found: ${invalidPermissions.join(', ')}`);
          throw new NotFoundException(
            `Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`,
            'PERMISSIONS_NOT_FOUND',
            { invalidPermissions }
          );
        }
      }
      
      const updatedRole = await this.roleRepository.update(id, updateRoleDto);
      if (!updatedRole) {
        this.logger.error(`Failed to update role with ID ${id}`);
        throw new InternalServerErrorException(
          'Error interno al actualizar el rol',
          'UPDATE_ROLE_FAILED'
        );
      }
      
      this.logger.log(`Role updated successfully: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      this.logger.error(`Error updating role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al actualizar el rol',
        'UPDATE_ROLE_ERROR',
        { originalError: error.message, roleId: id }
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting role with ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid role ID format: ${id}`);
        throw new BadRequestException(
          'ID de rol inválido',
          'INVALID_ROLE_ID'
        );
      }
      
      const deletedRole = await this.roleRepository.delete(id);
      if (!deletedRole) {
        this.logger.warn(`Role with ID ${id} not found for deletion`);
        throw new NotFoundException(
          `Rol con ID ${id} no encontrado`,
          'ROLE_NOT_FOUND',
          { roleId: id }
        );
      }
      
      this.logger.log(`Role deleted successfully: ${id}`);
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error deleting role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al eliminar el rol',
        'DELETE_ROLE_ERROR',
        { originalError: error.message, roleId: id }
      );
    }
  }

  async addPermission(roleId: string, permissionName: string): Promise<IRole> {
    try {
      this.logger.log(`Adding permission "${permissionName}" to role ${roleId}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(roleId)) {
        this.logger.warn(`Invalid role ID format: ${roleId}`);
        throw new BadRequestException(
          'ID de rol inválido',
          'INVALID_ROLE_ID'
        );
      }
      
      // Verificar si el permiso existe
      const permission = await this.permissionRepository.findByName(permissionName);
      if (!permission) {
        this.logger.warn(`Permission "${permissionName}" not found`);
        throw new NotFoundException(
          `Permiso ${permissionName} no encontrado`,
          'PERMISSION_NOT_FOUND',
          { permissionName }
        );
      }
      
      // Añadir el permiso al rol
      const updatedRole = await this.roleRepository.addPermission(roleId, permissionName);
      if (!updatedRole) {
        this.logger.warn(`Role with ID ${roleId} not found`);
        throw new NotFoundException(
          `Rol con ID ${roleId} no encontrado`,
          'ROLE_NOT_FOUND',
          { roleId }
        );
      }
      
      this.logger.log(`Permission "${permissionName}" added to role ${updatedRole.name} successfully`);
      return updatedRole;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error adding permission to role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al añadir permiso al rol',
        'ADD_PERMISSION_ERROR',
        { originalError: error.message, roleId, permissionName }
      );
    }
  }

  async removePermission(roleId: string, permissionName: string): Promise<IRole> {
    try {
      this.logger.log(`Removing permission "${permissionName}" from role ${roleId}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(roleId)) {
        this.logger.warn(`Invalid role ID format: ${roleId}`);
        throw new BadRequestException(
          'ID de rol inválido',
          'INVALID_ROLE_ID'
        );
      }
      
      // Verificar si el rol existe
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        this.logger.warn(`Role with ID ${roleId} not found`);
        throw new NotFoundException(
          `Rol con ID ${roleId} no encontrado`,
          'ROLE_NOT_FOUND',
          { roleId }
        );
      }
      
      // Verificar si el rol tiene ese permiso
      if (!role.permissions.includes(permissionName)) {
        this.logger.warn(`Role ${role.name} doesn't have permission "${permissionName}"`);
        throw new BadRequestException(
          `El rol no tiene el permiso ${permissionName}`,
          'PERMISSION_NOT_IN_ROLE',
          { roleId, permissionName }
        );
      }
      
      // Quitar el permiso
      const updatedRole = await this.roleRepository.removePermission(roleId, permissionName);
      
      // Asegurarse de que el resultado nunca sea null
      if (!updatedRole) {
        // Si por algún motivo no se obtiene un rol actualizado, devolver el rol original
        this.logger.warn(`Failed to update role ${roleId} when removing permission ${permissionName}`);
        // Return original role since we verified it exists
        return role;
      }
      
      this.logger.log(`Permission "${permissionName}" removed from role ${updatedRole.name} successfully`);
      return updatedRole;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error removing permission from role: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al quitar permiso del rol',
        'REMOVE_PERMISSION_ERROR',
        { originalError: error.message, roleId, permissionName }
      );
    }
  }
}