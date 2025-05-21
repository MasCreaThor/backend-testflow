// src/common/pipes/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/*
 Este método se ejecuta automáticamente antes de que los datos lleguen al controlador.
 Su objetivo es validar que el value recibido cumpla con las reglas del DTO.
*/
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Si el valor es nulo o indefinido, no se aplica la validación
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    /*Convierte el objeto plano recibido en una instancia de clase
    para que las reglas de validación puedan aplicarse.*/
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    
    if (errors.length > 0) {
      const formattedErrors = errors.map(error => {
        const constraints = error.constraints 
          ? Object.values(error.constraints) 
          : ['Error de validación'];
        
        return {
          property: error.property,
          messages: constraints,
        };
      });
      
      throw new BadRequestException({
        message: 'Error de validación',
        errors: formattedErrors,
      });
    }
    
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}