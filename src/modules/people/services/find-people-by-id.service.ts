// src/modules/people/services/find-people-by-id.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener un perfil de persona por su ID
 */
@Injectable()
export class FindPeopleByIdService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindPeopleByIdService.name);
  }

  /**
   * Obtiene un perfil de persona por su ID
   * @param id ID del perfil
   * @returns Perfil de persona encontrado
   * @throws NotFoundException si el perfil no existe
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(id: string): Promise<IPeople> {
    try {
      this.logger.debug(`Buscando perfil de persona con ID: ${id}`);
      const person = await this.peopleRepository.findById(id);
      
      if (!person) {
        this.logger.warn(`Perfil de persona con ID ${id} no encontrado`);
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }
      
      return person;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar perfil de persona por ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar el perfil de persona');
    }
  }
}