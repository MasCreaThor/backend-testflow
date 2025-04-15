// src/common/validation/validation.module.ts
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ValidationService } from '../services/validation.service';
import { IsEmailUniqueConstraint } from '../validators/unique-email.validator';
import { MongoIdValidationPipe } from '../pipes/mongo-id.validation.pipe';
import { UsersModule } from '../../modules/users/users.module';

@Module({
  imports: [
    UsersModule, // Necesario para inyectar UserRepository en IsEmailUniqueConstraint
  ],
  providers: [
    MongoIdValidationPipe,
    // Configuración global de ValidationPipe
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          whitelist: true, // Elimina propiedades no decoradas en los DTOs
          forbidNonWhitelisted: true, // Rechaza propiedades no decoradas
          transform: true, // Transforma las peticiones al tipo del DTO
          transformOptions: {
            enableImplicitConversion: true, // Permite conversiones implícitas
          },
          stopAtFirstError: true, // Detiene la validación en el primer error
          exceptionFactory: (errors) => {
            // Personalizar formato de errores
            const formattedErrors = errors.map((error) => {
              const constraints = error.constraints 
                ? Object.values(error.constraints) 
                : ['Error de validación'];
              
              return {
                property: error.property,
                value: error.value,
                constraints: constraints,
              };
            });
            
            // Devolver excepción con formato personalizado
            return new ValidationPipe().createExceptionFactory()();
          },
        });
      },
    },
    // Servicios de validación
    ValidationService,
    // Validadores personalizados
    IsEmailUniqueConstraint,
  ],
  exports: [
    ValidationService,
    MongoIdValidationPipe
  ],
})
export class ValidationModule {}