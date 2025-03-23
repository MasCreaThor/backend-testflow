// src/modules/roles/services/permission.service.ts
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PermissionRepository } from '../infra/repositories/permission.repository';
import { CreatePermissionDto, UpdatePermissionDto } from '../infra/model/dto';
import { IPermission } from '../infra/model/interfaces';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<IPermission[]> {
    return this.permissionRepository.findAll(activeOnly);
  }

  async findById(id: string): Promise<IPermission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    return permission;
  }

  async findByName(name: string): Promise<IPermission> {
    const permission = await this.permissionRepository.findByName(name);
    if (!permission) {
      throw new NotFoundException(`Permiso con nombre ${name} no encontrado`);
    }
    return permission;
  }

  async findByGroup(group: string): Promise<IPermission[]> {
    return this.permissionRepository.findByGroup(group);
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<IPermission> {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermission = await this.permissionRepository.findByName(createPermissionDto.name);
    if (existingPermission) {
      throw new ConflictException(`Ya existe un permiso con el nombre ${createPermissionDto.name}`);
    }

    // Asegurar formato apropiado para el nombre (resource:action)
    if (!createPermissionDto.name.includes(':')) {
      this.logger.warn(`El permiso ${createPermissionDto.name} no sigue el formato recomendado "resource:action"`);
    }
    
    return this.permissionRepository.create(createPermissionDto);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<IPermission> {
    // Verificar si el permiso existe
    const existingPermission = await this.permissionRepository.findById(id);
    if (!existingPermission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    
    // Si se está actualizando el nombre, verificar que no exista otro permiso con ese nombre
    if (updatePermissionDto.name && updatePermissionDto.name !== existingPermission.name) {
      const permissionWithSameName = await this.permissionRepository.findByName(updatePermissionDto.name);
      if (permissionWithSameName && permissionWithSameName._id !== id) {
        throw new ConflictException(`Ya existe otro permiso con el nombre ${updatePermissionDto.name}`);
      }
      
      // Asegurar formato apropiado para el nombre (resource:action)
      if (!updatePermissionDto.name.includes(':')) {
        this.logger.warn(`El permiso ${updatePermissionDto.name} no sigue el formato recomendado "resource:action"`);
      }
    }
    
    const updatedPermission = await this.permissionRepository.update(id, updatePermissionDto);
    if (!updatedPermission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    
    return updatedPermission;
  }

  async delete(id: string): Promise<void> {
    const deletedPermission = await this.permissionRepository.delete(id);
    if (!deletedPermission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
  }

  /**
   * Crea permisos CRUD para un recurso específico
   */
  async createCrudPermissions(resource: string, description: string = ''): Promise<IPermission[]> {
    const actions = ['create', 'read', 'update', 'delete', 'list'];
    const permissions: IPermission[] = [];
    
    for (const action of actions) {
      const permissionName = `${resource}:${action}`;
      const permissionDescription = `${description} - ${action}`;
      
      try {
        const existingPermission = await this.permissionRepository.findByName(permissionName);
        if (existingPermission) {
          permissions.push(existingPermission);
          continue;
        }
        
        const newPermission = await this.permissionRepository.create({
          name: permissionName,
          description: permissionDescription,
          group: resource,
        });
        
        permissions.push(newPermission);
      } catch (error) {
        this.logger.error(`Error al crear permiso ${permissionName}: ${error.message}`);
      }
    }
    
    return permissions;
  }
}