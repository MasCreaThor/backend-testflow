// src/modules/auth/services/login.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly updateLastLoginService: UpdateLastLoginService,
  ) {}

  async execute(loginDto: LoginDto): Promise<IAuthResponse> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.updateLastLoginService.execute(user._id as string);

    // Eliminar tokens de refresh anteriores
    await this.tokenRepository.deleteUserTokens(user._id as string, 'refresh');

    // Generar tokens
    const payload: IJwtPayload = { 
      sub: user._id as string, 
      email: user.email 
    };
    
    // Obtener y asegurar que secret tenga un valor definido
    const secret = this.configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT secret not configured');
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

    // Preparar respuesta
    const sanitizedUser = Helper.sanitizeUser(user);
    
    return {
      user: {
        _id: sanitizedUser._id as string,
        email: sanitizedUser.email,
        name: sanitizedUser.name,
      },
      accessToken,
      refreshToken,
    };
  }
}