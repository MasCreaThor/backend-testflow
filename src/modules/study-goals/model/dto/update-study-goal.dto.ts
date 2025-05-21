// src/modules/study-goals/model/dto/update-study-goal.dto.ts
import { IsString, IsOptional, IsMongoId, IsBoolean, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para actualizar objetivos de estudio
 */
export class UpdateStudyGoalDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  readonly name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(1000, { message: 'La descripción no puede exceder los 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  readonly description?: string;

  @IsOptional()
  @IsMongoId({ message: 'El ID de categoría no es válido' })
  readonly categoryId?: string;
  
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  readonly isActive?: boolean;
}