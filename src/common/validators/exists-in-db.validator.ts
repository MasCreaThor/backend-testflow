// src/common/validators/exists-in-db.validator.ts
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { Types } from 'mongoose';
import { ModuleRef } from '@nestjs/core';

/**
 * Validador que verifica que una entidad existe en la base de datos
 */
@ValidatorConstraint({ name: 'existsInDb', async: true })
@Injectable()
export class ExistsInDbConstraint implements ValidatorConstraintInterface {
  constructor(private moduleRef: ModuleRef) {}
  
  async validate(value: string, args: ValidationArguments) {
    if (!value) return true; // Si no hay valor, otros validadores se encargarán
    
    // Verificar formato de MongoDB ID
    if (!Types.ObjectId.isValid(value)) {
      return false;
    }
    
    // El primer constraint debe ser el nombre de la entidad
    const entityName = args.constraints[0];
    
    // Obtener el repositorio dinámicamente
    try {
      const repositoryName = `${entityName.charAt(0).toLowerCase() + entityName.slice(1)}Repository`;
      const repository = this.moduleRef.get(repositoryName, { strict: false });
      
      if (!repository || typeof repository.findById !== 'function') {
        return false;
      }
      
      const entity = await repository.findById(value);
      return !!entity; // true si la entidad existe
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const entityName = args.constraints[0];
    return `La ${entityName.toLowerCase()} con ID ${args.value} no existe`;
  }
}

/**
 * Decorador para verificar que una entidad existe en la base de datos
 * @param entityName Nombre de la entidad a verificar (debe coincidir con el nombre del repositorio)
 * @param validationOptions Opciones adicionales de validación
 */
export function ExistsInDb(entityName: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'existsInDb',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityName],
      validator: ExistsInDbConstraint,
    });
  };
}