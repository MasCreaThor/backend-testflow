// src/modules/roles/services/find-role-by-name.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener un rol por su nombre
 */
@Injectable()
export class FindRoleByNameService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindRoleByNameService.name);
  }

  /**
   * Obtiene un rol por su nombre
   * @param name Nombre del rol
   * @returns Rol encontrado
   * @throws NotFoundException si el rol no existe
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(name: string): Promise<IRole> {
    try {
      this.logger.debug(`Buscando rol con nombre: ${name}`);
      const role = await this.roleRepository.findByName(name);
      
      if (!role) {
        this.logger.warn(`Rol con nombre ${name} no encontrado`);
        throw new NotFoundException(`Rol con nombre ${name} no encontrado`);
      }
      
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar rol por nombre: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar el rol');
    }
  }
}