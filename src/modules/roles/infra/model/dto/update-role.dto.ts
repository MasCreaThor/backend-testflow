// src/modules/roles/model/dto/update-role.dto.ts
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  readonly name?: string;

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