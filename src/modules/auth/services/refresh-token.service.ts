// src/modules/auth/services/refresh-token.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { RefreshTokenDto } from '../model/dto';
import { IAuthResponse, IJwtPayload } from '../model/interfaces';
import { 
  UnauthorizedException, 
  NotFoundException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto): Promise<IAuthResponse> {
    try {
      this.logger.debug(`Processing refresh token request`);
      
      // Verificar si el token existe y es válido
      const tokenRecord = await this.tokenRepository.findByToken(refreshTokenDto.refreshToken);
      if (!tokenRecord) {
        this.logger.warn(`Invalid refresh token provided`);
        throw new UnauthorizedException(
          'Token de refresco inválido', 
          'INVALID_REFRESH_TOKEN'
        );
      }

      // Verificar si el token ha sido usado
      if (tokenRecord.used) {
        this.logger.warn(`Attempt to use already used refresh token: ${tokenRecord._id}`);
        throw new UnauthorizedException(
          'Token de refresco ya utilizado', 
          'TOKEN_ALREADY_USED'
        );
      }

      // Verificar si el token ha expirado
      if (new Date() > tokenRecord.expiresAt) {
        this.logger.warn(`Attempt to use expired refresh token: ${tokenRecord._id}`);
        throw new UnauthorizedException(
          'Token de refresco expirado', 
          'TOKEN_EXPIRED'
        );
      }

      // Buscar el usuario
      const user = await this.userRepository.findById(tokenRecord.userId);
      if (!user) {
        this.logger.warn(`User not found for refresh token: ${tokenRecord.userId}`);
        throw new NotFoundException(
          'Usuario no encontrado', 
          'USER_NOT_FOUND',
          { userId: tokenRecord.userId }
        );
      }

      // Marcar el token como usado
      try {
        await this.tokenRepository.markAsUsed(tokenRecord._id);
        this.logger.debug(`Marked refresh token as used: ${tokenRecord._id}`);
      } catch (error) {
        // Non-critical error, just log it
        this.logger.warn(`Failed to mark token as used: ${error.message}`);
      }

      // Generar un nuevo access token
      const payload: IJwtPayload = { 
        sub: user._id,
        email: user.email 
      };
      
      const accessToken = this.jwtService.sign(payload);
      this.logger.debug(`Generated new access token for user: ${user._id}`);
      
      // Generar un nuevo refresh token
      const newRefreshToken = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días de expiración por defecto
      
      // Guardar el nuevo refresh token
      await this.tokenRepository.create({
        userId: user._id,
        token: newRefreshToken,
        expiresAt,
        used: false,
        type: 'refresh',
      });
      this.logger.debug(`Generated new refresh token for user: ${user._id}`);

      this.logger.log(`Successfully refreshed token for user: ${user._id}`);
      return {
        user: {
          _id: user._id,
          email: user.email,
        },
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof UnauthorizedException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Token refresh error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno durante el refresco del token',
        'REFRESH_TOKEN_ERROR',
        { originalError: error.message }
      );
    }
  }
}