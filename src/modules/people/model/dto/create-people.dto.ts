// src/modules/people/model/dto/create-people.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePeopleDto {
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  readonly userId: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  readonly firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  readonly lastName: string;

  @IsOptional()
  @IsArray({ message: 'Los objetivos de estudio deben ser un arreglo' })
  readonly studyGoals?: string[];
}