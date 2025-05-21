// src/modules/people/services/find-all-people.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para obtener todos los perfiles de personas
 */
@Injectable()
export class FindAllPeopleService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindAllPeopleService.name);
  }

  /**
   * Obtiene todos los perfiles de personas
   * @returns Lista de perfiles de personas
   * @throws InternalServerErrorException si ocurre un error en la consulta
   */
  async execute(): Promise<IPeople[]> {
    try {
      this.logger.debug('Buscando todos los perfiles de personas');
      const people = await this.peopleRepository.findAll();
      this.logger.debug(`Encontrados ${people.length} perfiles de personas`);
      return people;
    } catch (error) {
      this.logger.error(`Error al buscar todos los perfiles de personas: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener los perfiles de personas');
    }
  }
}