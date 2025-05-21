// src/modules/roles/model/dto/assign-role.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsMongoId, IsDateString } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  @IsMongoId({ message: 'El ID de usuario debe ser un MongoID válido' })
  readonly userId: string;

  @IsNotEmpty({ message: 'El ID de rol es requerido' })
  @IsMongoId({ message: 'El ID de rol debe ser un MongoID válido' })
  readonly roleId: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  readonly expiresAt?: Date;

  @IsOptional()
  @IsMongoId({ message: 'El ID de quien otorga el rol debe ser un MongoID válido' })
  readonly grantedBy?: string;
}