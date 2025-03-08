// src/modules/study-goals/model/dto/create-study-goal.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStudyGoalDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  readonly description?: string;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  readonly category?: string;
}