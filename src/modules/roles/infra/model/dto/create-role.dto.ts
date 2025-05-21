// src/modules/roles/model/dto/create-role.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  readonly description?: string;

  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  readonly permissions?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  readonly isActive?: boolean;
}