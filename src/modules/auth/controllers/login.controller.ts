// src/modules/auth/controllers/login.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginService } from '../services';
import { LoginDto } from '../model/dto';
import { IAuthResponse } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para el inicio de sesión de usuarios
 */
@Controller('auth')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(LoginController.name);
  }

  /**
   * Procesa la solicitud de inicio de sesión
   * @param loginDto Credenciales de inicio de sesión
   * @returns Respuesta de autenticación con tokens y usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async handle(@Body() loginDto: LoginDto): Promise<IAuthResponse> {
    this.logger.log(`Intento de inicio de sesión: ${loginDto.email}`);
    return this.loginService.execute(loginDto);
  }
}