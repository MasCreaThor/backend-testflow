// src/modules/study-goals/model/dto/create-study-goal.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsMongoId, ValidateIf } from 'class-validator';
import { IsStudyGoalNameUniqueConstraint } from '../../../../common/validators/unique-name.validator';
import { ExistsInDb } from '../../../../common/validators/exists-in-db.validator';
import { Type } from 'class-transformer';

export class CreateStudyGoalDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Type(() => IsStudyGoalNameUniqueConstraint)
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  readonly description?: string;

  @IsOptional()
  @ValidateIf(o => o.categoryId !== null && o.categoryId !== undefined && o.categoryId !== '')
  @IsMongoId({ message: 'El ID de categoría no es válido' })
  @ExistsInDb('Category', { message: 'La categoría especificada no existe' })
  readonly categoryId?: string;
  
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  readonly isActive?: boolean;
}