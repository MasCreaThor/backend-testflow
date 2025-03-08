// src/modules/users/model/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  readonly email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  readonly password: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  readonly first_name: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  readonly last_name: string;
}
