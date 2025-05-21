// src/modules/roles/model/dto/update-permission.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString({ message: 'El nombre del permiso debe ser una cadena de texto' })
  readonly name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  readonly description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  readonly isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'El grupo debe ser una cadena de texto' })
  readonly group?: string;
}