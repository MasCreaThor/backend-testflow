// src/modules/categories/model/dto/create-category.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { IsCategoryNameUniqueConstraint } from '../../../../common/validators/unique-name.validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Type(() => IsCategoryNameUniqueConstraint)
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  readonly description?: string;
  
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  readonly isActive?: boolean;
}