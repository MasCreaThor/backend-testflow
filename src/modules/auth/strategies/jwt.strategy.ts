// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from '../../users/infra/repositories';
import { IJwtPayload } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Estrategia JWT para autenticación de tokens
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'testflow-secret-key',
    });
    
    this.logger.setContext(JwtStrategy.name);
  }

  /**
   * Valida el payload del token JWT
   * @param payload Payload del token JWT
   * @returns Usuario autenticado sin contraseña
   * @throws UnauthorizedException si el usuario no existe
   */
  async validate(payload: IJwtPayload) {
    this.logger.debug(`Validando token JWT para usuario ID: ${payload.sub}`);
    
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      this.logger.warn(`Usuario con ID ${payload.sub} no encontrado durante validación JWT`);
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    this.logger.debug(`Usuario encontrado: ${user.email}`);
    
    // No devolver la contraseña
    const { password, ...result } = user;
    return result;
  }
}