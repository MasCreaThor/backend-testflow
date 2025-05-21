// src/modules/roles/services/find-role-by-id.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener un rol por su ID
 */
@Injectable()
export class FindRoleByIdService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindRoleByIdService.name);
  }

  /**
   * Obtiene un rol por su ID
   * @param id ID del rol
   * @returns Rol encontrado
   * @throws NotFoundException si el rol no existe
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(id: string): Promise<IRole> {
    try {
      this.logger.debug(`Buscando rol con ID: ${id}`);
      const role = await this.roleRepository.findById(id);
      
      if (!role) {
        this.logger.warn(`Rol con ID ${id} no encontrado`);
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }
      
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar rol por ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar el rol');
    }
  }
}