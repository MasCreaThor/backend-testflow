// src/modules/people/services/find-people-by-user-id.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener un perfil de persona por su ID de usuario
 */
@Injectable()
export class FindPeopleByUserIdService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindPeopleByUserIdService.name);
  }

  /**
   * Obtiene un perfil de persona por su ID de usuario
   * @param userId ID del usuario
   * @returns Perfil de persona encontrado
   * @throws NotFoundException si el perfil no existe
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(userId: string): Promise<IPeople> {
    try {
      this.logger.debug(`Buscando perfil de persona para usuario con ID: ${userId}`);
      const person = await this.peopleRepository.findByUserId(userId);
      
      if (!person) {
        this.logger.warn(`Perfil de persona para usuario con ID ${userId} no encontrado`);
        throw new NotFoundException(`Persona con ID de usuario ${userId} no encontrada`);
      }
      
      return person;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al buscar perfil de persona por ID de usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar el perfil de persona');
    }
  }
}