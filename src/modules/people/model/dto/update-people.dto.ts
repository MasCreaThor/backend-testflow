// src/modules/people/model/dto/update-people.dto.ts
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdatePeopleDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  readonly firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  readonly lastName?: string;

  @IsOptional()
  @IsArray({ message: 'Los objetivos de estudio deben ser un arreglo' })
  readonly studyGoals?: string[];
}