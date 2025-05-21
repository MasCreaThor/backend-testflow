// src/modules/roles/services/find-all-roles.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '../infra/repositories';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener todos los roles
 */
@Injectable()
export class FindAllRolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindAllRolesService.name);
  }

  /**
   * Obtiene todos los roles
   * @param activeOnly Filtrar solo roles activos
   * @returns Lista de roles
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(activeOnly: boolean = false): Promise<IRole[]> {
    try {
      this.logger.debug(`Buscando todos los roles. activeOnly=${activeOnly}`);
      const roles = await this.roleRepository.findAll(activeOnly);
      this.logger.debug(`Encontrados ${roles.length} roles`);
      return roles;
    } catch (error) {
      this.logger.error(`Error al buscar todos los roles: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener los roles');
    }
  }
}