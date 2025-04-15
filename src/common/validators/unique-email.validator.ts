// src/common/validators/unique-email.validator.ts
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { UserRepository } from '../../modules/users/infra/repositories/user.repository';

/**
 * Validator que verifica que un email no existe ya en la base de datos
 */
@ValidatorConstraint({ name: 'isEmailUnique', async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private userRepository: UserRepository) {}

  async validate(email: string, args: ValidationArguments) {
    if (!email) return true; // Si no hay email, otros validadores se encargarán

    try {
      const user = await this.userRepository.findByEmail(email);
      return !user; // true si el usuario no existe (email es único)
    } catch (error) {
      // En caso de error de conexión, etc., no bloquear la validación
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `El correo electrónico ya está registrado`;
  }
}

/**
 * Decorador para verificar que un email es único en la base de datos
 */
export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEmailUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}