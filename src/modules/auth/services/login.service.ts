// src/modules/auth/services/login.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { PeopleRepository } from '../../people/infra/repositories';
import { UpdateLastLoginService } from '../../users/services';
import { TokenRepository } from '../infra/repositories';
import { LoginDto } from '../model/dto';
import { IAuthResponse, IJwtPayload } from '../model/interfaces';
import { Helper } from '../../../common/utils';
import { 
  UnauthorizedException, 
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly peopleRepository: PeopleRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly updateLastLoginService: UpdateLastLoginService,
  ) {}

  async execute(loginDto: LoginDto): Promise<IAuthResponse> {
    try {
      this.logger.debug(`Login attempt for email: ${loginDto.email}`);

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(loginDto.email);
      if (!user) {
        this.logger.warn(`Login failed: User not found with email ${loginDto.email}`);
        throw new UnauthorizedException(
          'Credenciales inválidas', 
          'INVALID_CREDENTIALS'
        );
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Invalid password for user ${loginDto.email}`);
        throw new UnauthorizedException(
          'Credenciales inválidas', 
          'INVALID_CREDENTIALS'
        );
      }

      // Actualizar último login
      try {
        await this.updateLastLoginService.execute(user._id as string);
      } catch (error) {
        // Non-critical error, just log it but continue login process
        this.logger.warn(`Failed to update last login for user ${user._id}: ${error.message}`);
      }

      // Eliminar tokens de refresh anteriores
      try {
        await this.tokenRepository.deleteUserTokens(user._id as string, 'refresh');
      } catch (error) {
        // Non-critical error, just log it
        this.logger.warn(`Failed to delete old refresh tokens for user ${user._id}: ${error.message}`);
      }

      // Generar tokens
      const payload: IJwtPayload = { 
        sub: user._id as string, 
        email: user.email 
      };
      
      // Obtener y asegurar que secret tenga un valor definido
      const secret = this.configService.get<string>('jwt.secret');
      if (!secret) {
        this.logger.error('JWT secret not configured in environment variables');
        throw new InternalServerErrorException(
          'Error de configuración del servidor', 
          'JWT_SECRET_MISSING'
        );
      }
      
      // Generar access token con el secret verificado
      const accessToken = this.jwtService.sign(payload, { 
        secret: secret 
      });
      
      // Generar refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');
      
      // Obtener expiración con valor seguro
      const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
      
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

      this.logger.log(`User ${user._id} logged in successfully`);

      // Preparar respuesta
      const sanitizedUser = Helper.sanitizeUser(user);
      
      return {
        user: {
          _id: sanitizedUser._id as string,
          email: sanitizedUser.email,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Re-throw AppExceptions (our custom exceptions)
      if (error.name === 'AppException' || error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Log unexpected errors and wrap in an InternalServerErrorException
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno durante el proceso de inicio de sesión',
        'LOGIN_INTERNAL_ERROR',
        { originalError: error.message }
      );
    }
  }
}