// src/modules/auth/controllers/register.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterService } from '../services';
import { RegisterDto } from '../model/dto';
import { IAuthResponse } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para el registro de nuevos usuarios
 */
@Controller('auth')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(RegisterController.name);
  }

  /**
   * Procesa la solicitud de registro de nuevos usuarios
   * @param registerDto Datos para el registro
   * @returns Respuesta de autenticación con tokens y usuario
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body() registerDto: RegisterDto): Promise<IAuthResponse> {
    this.logger.log(`Intento de registro: ${registerDto.email}`);
    return this.registerService.execute(registerDto);
  }
}