// src/modules/users/model/dto/update-user.dto.ts
import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  readonly email?: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  readonly password?: string;

  @IsOptional()
  readonly name?: string;
}