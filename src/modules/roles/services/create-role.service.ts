// src/modules/roles/services/create-role.service.ts
import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { PermissionRepository } from '../infra/repositories';
import { CreateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para crear roles
 */
@Injectable()
export class CreateRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreateRoleService.name);
  }

  /**
   * Crea un nuevo rol
   * @param createRoleDto Datos para la creación
   * @returns Rol creado
   * @throws ConflictException si ya existe un rol con el mismo nombre
   * @throws NotFoundException si alguno de los permisos no existe
   * @throws InternalServerErrorException si ocurre un error en la creación
   */
  async execute(createRoleDto: CreateRoleDto): Promise<IRole> {
    try {
      // Verificar si ya existe un rol con el mismo nombre
      this.logger.debug(`Verificando si ya existe un rol con nombre: ${createRoleDto.name}`);
      const existingRole = await this.roleRepository.findByName(createRoleDto.name);
      
      if (existingRole) {
        this.logger.warn(`Ya existe un rol con el nombre ${createRoleDto.name}`);
        throw new ConflictException(`Ya existe un rol con el nombre ${createRoleDto.name}`);
      }
      
      // Verificar que los permisos existan
      if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
        this.logger.debug(`Verificando existencia de permisos: ${createRoleDto.permissions.join(', ')}`);
        const permissions = await this.permissionRepository.findByNames(createRoleDto.permissions);
        
        if (permissions.length !== createRoleDto.permissions.length) {
          const foundPermissionNames = permissions.map(p => p.name);
          const invalidPermissions = createRoleDto.permissions.filter(p => !foundPermissionNames.includes(p));
          
          this.logger.warn(`Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`);
          throw new NotFoundException(`Los siguientes permisos no existen: ${invalidPermissions.join(', ')}`);
        }
      }
      
      // Crear rol
      this.logger.debug(`Creando nuevo rol: ${createRoleDto.name}`);
      const newRole = await this.roleRepository.create(createRoleDto);
      this.logger.log(`Rol creado con ID: ${newRole._id}`);
      
      return newRole;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al crear rol: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear el rol');
    }
  }
}