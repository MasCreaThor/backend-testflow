// src/modules/roles/model/dto/create-permission.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'El nombre del permiso es requerido' })
  @IsString({ message: 'El nombre del permiso debe ser una cadena de texto' })
  readonly name: string;

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