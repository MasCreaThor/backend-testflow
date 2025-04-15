// src/common/pipes/entity-exists-factory.ts
import { PipeTransform, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotFoundException } from '../exceptions/app-exception';
import { MongoIdValidationPipe } from './mongo-id.validation.pipe';

/**
 * Fábrica para crear pipes de validación de existencia de entidades
 * Evita los problemas de inyección de dependencias en los controladores
 */
export class EntityExistsFactory {
  /**
   * Crea un pipe para validar que una entidad existe
   * @param findFunction Función que devuelve la entidad o null si no existe
   * @param entityName Nombre de la entidad para mensajes de error
   * @param paramName Nombre del parámetro para validación de ID
   */
  static create(
    findFunction: (id: string) => Promise<any | null>,
    entityName: string,
    paramName: string = 'id'
  ): PipeTransform {
    @Injectable()
    class EntityExistsPipeClass implements PipeTransform {
      private readonly mongoIdPipe: MongoIdValidationPipe;

      constructor() {
        this.mongoIdPipe = new MongoIdValidationPipe(paramName);
      }

      async transform(value: string): Promise<string> {
        // Primero validamos que el ID tiene formato válido
        const validatedId = this.mongoIdPipe.transform(value, { type: 'param', data: paramName });
        
        // Buscamos la entidad en la base de datos
        const entity = await findFunction(validatedId);
        
        // Si no existe, lanzamos un error
        if (!entity) {
          throw new NotFoundException(
            `${entityName} con ID ${validatedId} no encontrado`,
            `${entityName.toUpperCase()}_NOT_FOUND`,
            { entityId: validatedId, entityType: entityName }
          );
        }
        
        // Si existe, devolvemos el ID validado
        return validatedId;
      }
    }

    return new EntityExistsPipeClass();
  }
}