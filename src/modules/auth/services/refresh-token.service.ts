// src/modules/auth/services/refresh-token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { RefreshTokenDto } from '../model/dto';
import { IAuthResponse, IJwtPayload } from '../model/interfaces';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto): Promise<IAuthResponse> {
    // Verificar si el token existe y es válido
    const tokenRecord = await this.tokenRepository.findByToken(refreshTokenDto.refreshToken);
    if (!tokenRecord) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    // Verificar si el token ha sido usado
    if (tokenRecord.used) {
      throw new UnauthorizedException('Token de refresco ya utilizado');
    }

    // Verificar si el token ha expirado
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Token de refresco expirado');
    }

    // Buscar el usuario
    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Marcar el token como usado
    await this.tokenRepository.markAsUsed(tokenRecord._id);

    // Generar un nuevo access token
    const payload: IJwtPayload = { 
      sub: user._id,
      email: user.email 
    };
    
    const accessToken = this.jwtService.sign(payload);
    
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

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}