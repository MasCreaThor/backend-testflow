// src/common/services/validation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { 
  BadRequestException, 
  NotFoundException 
} from '../exceptions/app-exception';

/**
 * Servicio centralizado para validaciones comunes entre módulos
 */
@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  /**
   * Valida que un ID de MongoDB sea válido y convierte a un mensaje de error personalizado
   * @param id - ID a validar
   * @param entityName - Nombre de la entidad para personalizar mensajes
   * @param paramName - Nombre del parámetro para errores
   */
  validateMongoId(id: string, entityName: string, paramName: string = 'id'): string {
    if (!id || typeof id !== 'string') {
      this.logger.warn(`ID de ${entityName} no proporcionado`);
      throw new BadRequestException(
        `El ${paramName} de ${entityName} es requerido`,
        'ID_REQUIRED',
        { paramName, entityName }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(`Formato de ID inválido: ${id} para ${entityName}`);
      throw new BadRequestException(
        `El formato del ${paramName} de ${entityName} no es válido`,
        'INVALID_ID_FORMAT',
        { paramName, entityName, value: id }
      );
    }

    return id;
  }

  /**
   * Valida que una entidad exista, lanzando un NotFoundException si no
   * @param entity - Entidad a validar
   * @param id - ID de la entidad buscada
   * @param entityName - Nombre de la entidad para personalizar mensajes
   */
  validateEntityExists<T>(entity: T | null, id: string, entityName: string): T {
    if (!entity) {
      this.logger.warn(`${entityName} con ID ${id} no encontrado`);
      throw new NotFoundException(
        `${entityName} con ID ${id} no encontrado`,
        `${entityName.toUpperCase()}_NOT_FOUND`,
        { entityName, id }
      );
    }
    return entity;
  }

  /**
   * Valida que un nombre no esté ya en uso para una entidad específica
   * @param existingEntity - Entidad existente con el mismo nombre (o null)
   * @param name - Nombre a verificar
   * @param entityName - Nombre de la entidad para personalizar mensajes
   * @param currentId - ID de la entidad actual (para validar en actualizaciones)
   */
  validateNameUniqueness<T extends { _id: string }>(
    existingEntity: T | null, 
    name: string, 
    entityName: string,
    currentId?: string
  ): void {
    if (existingEntity) {
      // Si es una actualización, verificar que no sea la misma entidad
      if (currentId && existingEntity._id === currentId) {
        return; // Mismo ID, es la entidad que estamos actualizando
      }
      
      this.logger.warn(`Ya existe un/a ${entityName} con el nombre "${name}"`);
      throw new BadRequestException(
        `Ya existe un/a ${entityName} con el nombre "${name}"`,
        `${entityName.toUpperCase()}_NAME_EXISTS`,
        { entityName, name }
      );
    }
  }
}