// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from '../../users/infra/repositories';
import { IJwtPayload } from '../model/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'testflow-secret-key',
    });
  }

  async validate(payload: IJwtPayload) {
    this.logger.debug(`Validando token JWT: ${JSON.stringify(payload)}`);
    
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      this.logger.error(`Usuario con ID ${payload.sub} no encontrado durante validación JWT`);
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    this.logger.debug(`Usuario encontrado: ${user.email}`);
    
    // No devolver la contraseña
    const { password, ...result } = user;
    return result;
  }
}