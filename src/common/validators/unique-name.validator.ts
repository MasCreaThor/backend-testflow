// src/common/validators/unique-name.validator.ts
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

/**
 * Validador abstracto para nombres únicos
 * Debe ser extendido por cada entidad específica que requiera validación de nombres únicos
 */
@ValidatorConstraint({ name: 'isNameUnique', async: true })
@Injectable()
export abstract class IsNameUniqueConstraint implements ValidatorConstraintInterface {
  abstract findByName(name: string): Promise<any>;
  abstract getEntityName(): string;

  async validate(name: string, args: ValidationArguments) {
    if (!name) return true; // Si no hay nombre, otros validadores se encargarán

    try {
      const entity = await this.findByName(name);
      return !entity; // true si la entidad no existe (nombre es único)
    } catch (error) {
      // En caso de error de conexión, etc., no bloquear la validación
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Ya existe un/a ${this.getEntityName()} con este nombre`;
  }
}

/**
 * Decorador para verificar que un nombre es único para una entidad específica
 * @param validatorClass Clase del validador que implementa IsNameUniqueConstraint
 * @param validationOptions Opciones adicionales de validación
 */
export function IsNameUnique(
  validatorClass: any, 
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNameUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: validatorClass,
    });
  };
}

/**
 * Implementación específica para validación de nombres de categoría
 */
@ValidatorConstraint({ name: 'isCategoryNameUnique', async: true })
@Injectable()
export class IsCategoryNameUniqueConstraint extends IsNameUniqueConstraint {
  constructor(private categoryRepository: any) {
    super();
  }

  async findByName(name: string): Promise<any> {
    return await this.categoryRepository.findByName(name);
  }

  getEntityName(): string {
    return 'categoría';
  }
}

/**
 * Implementación específica para validación de nombres de objetivos de estudio
 */
@ValidatorConstraint({ name: 'isStudyGoalNameUnique', async: true })
@Injectable()
export class IsStudyGoalNameUniqueConstraint extends IsNameUniqueConstraint {
  constructor(private studyGoalRepository: any) {
    super();
  }

  async findByName(name: string): Promise<any> {
    return await this.studyGoalRepository.findByName(name);
  }

  getEntityName(): string {
    return 'objetivo de estudio';
  }
}