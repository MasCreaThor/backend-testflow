// src/modules/people/services/delete-people.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para eliminar perfiles de personas
 */
@Injectable()
export class DeletePeopleService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeletePeopleService.name);
  }

  /**
   * Elimina un perfil de persona existente
   * @param id ID del perfil a eliminar
   * @throws NotFoundException si el perfil no existe
   * @throws InternalServerErrorException si ocurre un error en la eliminación
   */
  async execute(id: string): Promise<void> {
    try {
      this.logger.debug(`Verificando existencia de perfil de persona: ${id}`);
      const existingPerson = await this.peopleRepository.findById(id);
      
      if (!existingPerson) {
        this.logger.warn(`Perfil de persona con ID ${id} no encontrado`);
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }

      this.logger.debug(`Eliminando perfil de persona: ${id}`);
      const deletedPerson = await this.peopleRepository.delete(id);
      
      if (!deletedPerson) {
        this.logger.warn(`No se pudo eliminar el perfil de persona con ID ${id}`);
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }
      
      this.logger.log(`Perfil de persona eliminado: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error al eliminar perfil de persona: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al eliminar el perfil de persona');
    }
  }
}