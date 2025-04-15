// src/common/pipes/mongo-id.validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BadRequestException as AppBadRequestException } from '../exceptions/app-exception';

/**
 * Pipe para validar que un string es un ID de MongoDB válido
 */
@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string> {
  /**
   * Nombre del parámetro para mensajes de error personalizados
   */
  private paramName: string;

  /**
   * @param paramName Nombre del parámetro que se está validando (ej: 'userId', 'categoryId')
   */
  constructor(paramName = 'id') {
    this.paramName = paramName;
  }

  transform(value: string, metadata: ArgumentMetadata): string {
    // Verificar que el valor es un string no vacío
    if (!value || typeof value !== 'string') {
      throw new AppBadRequestException(
        `El ${this.paramName} es requerido`,
        'INVALID_ID_FORMAT',
        { paramName: this.paramName, value }
      );
    }

    // Verificar que el valor es un ObjectId válido
    if (!Types.ObjectId.isValid(value)) {
      throw new AppBadRequestException(
        `El formato del ${this.paramName} no es válido`,
        'INVALID_MONGO_ID',
        { paramName: this.paramName, value }
      );
    }

    return value;
  }
}