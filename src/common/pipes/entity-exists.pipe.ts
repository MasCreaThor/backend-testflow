// src/common/pipes/entity-exists.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotFoundException } from '../exceptions/app-exception';
import { MongoIdValidationPipe } from './mongo-id.validation.pipe';

/**
 * Pipe genérico para validar que una entidad existe en la base de datos
 * Este pipe primero valida que el ID es un ObjectId válido y luego
 * comprueba que la entidad existe usando el repositorio proporcionado
 */
@Injectable()
export class EntityExistsPipe implements PipeTransform<string> {
  private readonly mongoIdPipe: MongoIdValidationPipe;
  private readonly repository: any;
  private readonly entityName: string;
  private readonly method: string;

  /**
   * @param repository Repositorio para buscar la entidad
   * @param entityName Nombre de la entidad para mensajes de error
   * @param method Método del repositorio para buscar la entidad (por defecto findById)
   * @param paramName Nombre del parámetro para validación de ID
   */
  constructor(
    repository: any,
    entityName: string,
    method: string = 'findById',
    paramName: string = 'id'
  ) {
    this.repository = repository;
    this.entityName = entityName;
    this.method = method;
    this.mongoIdPipe = new MongoIdValidationPipe(paramName);
  }

  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    // Primero validamos que el ID tiene formato válido
    const validatedId = this.mongoIdPipe.transform(value, metadata);
    
    // Buscamos la entidad en la base de datos
    const entity = await this.repository[this.method](validatedId);
    
    // Si no existe, lanzamos un error
    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} con ID ${validatedId} no encontrado`,
        `${this.entityName.toUpperCase()}_NOT_FOUND`,
        { entityId: validatedId, entityType: this.entityName }
      );
    }
    
    // Si existe, devolvemos el ID validado
    return validatedId;
  }
}