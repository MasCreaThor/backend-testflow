// src/modules/auth/services/login.service.ts
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { UpdateLastLoginService } from '../../users/services';
import { TokenRepository } from '../infra/repositories';
import { LoginDto } from '../model/dto';
import { IAuthResponse, IJwtPayload } from '../model/interfaces';
import { Helper } from '../../../common/utils';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para el inicio de sesión de usuarios
 */
@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly updateLastLoginService: UpdateLastLoginService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(LoginService.name);
  }

  /**
   * Procesa el inicio de sesión de un usuario
   * @param loginDto Credenciales de inicio de sesión
   * @returns Respuesta de autenticación con tokens y usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   * @throws InternalServerErrorException si ocurre un error durante el proceso
   */
  async execute(loginDto: LoginDto): Promise<IAuthResponse> {
    try {
      this.logger.debug(`Procesando inicio de sesión para: ${loginDto.email}`);
      
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(loginDto.email);
      if (!user) {
        this.logger.warn(`Intento de login con email inexistente: ${loginDto.email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Contraseña incorrecta para usuario: ${loginDto.email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Actualizar último login
      await this.updateLastLoginService.execute(user._id);

      // Eliminar tokens de refresh anteriores
      await this.tokenRepository.deleteUserTokens(user._id, 'refresh');

      // Generar tokens
      const payload: IJwtPayload = { 
        sub: user._id, 
        email: user.email 
      };
      
      // Obtener valores de configuración - SOLUCIÓN: acceder a las variables correctamente
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        this.logger.error('JWT secret no configurado');
        throw new Error('JWT secret not configured');
      }
      
      // Generar access token con el secret verificado
      const accessToken = this.jwtService.sign(payload, { 
        secret: secret 
      });
      
      // Generar refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');
      
      // Obtener expiración con valor seguro - SOLUCIÓN: acceder a la variable correcta
      const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
      
      // Parsear los días de forma segura
      const daysString = refreshTokenExpiresIn.replace('d', '');
      const days = Number(daysString) || 7; // Si no es un número, usar 7 como predeterminado
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      
      // Guardar refresh token
      await this.tokenRepository.create({
        userId: user._id,
        token: refreshToken,
        expiresAt,
        used: false,
        type: 'refresh',
      });

      this.logger.log(`Login exitoso para usuario: ${user.email}`);

      // Verificar y registrar los valores para depuración
      this.logger.debug(`Usuario ID: ${user._id}, tipo: ${typeof user._id}`);
      
      // Forma segura de convertir a string sin depender de toString
      let userId: string;
      if (typeof user._id === 'string') {
        userId = user._id;
      } else if (user._id) {
        // Si es un ObjectId u otro objeto usa String()
        userId = String(user._id);
      } else {
        // En caso extremadamente improbable de que _id sea nulo o indefinido
        this.logger.error('ID de usuario es nulo o indefinido');
        throw new InternalServerErrorException('Error en la identificación del usuario');
      }
      
      // Construir respuesta asegurando que _id es un string
      const response: IAuthResponse = {
        user: {
          _id: userId,
          email: user.email,
        },
        accessToken,
        refreshToken,
      };
      
      // Registrar la respuesta para depuración
      this.logger.debug(`Respuesta de login: ${JSON.stringify(response)}`);
      
      return response;
    } catch (error) {
      // Propagar errores de autenticación
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`Error en el proceso de login: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error en el proceso de inicio de sesión');
    }
  }
}