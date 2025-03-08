// src/modules/auth/services/register.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { CreateUserService } from '../../users/services';
import { PeopleRepository } from '../../people/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { RegisterDto } from '../model/dto';
import { IAuthResponse, IJwtPayload } from '../model/interfaces';

@Injectable()
export class RegisterService {
  private readonly logger = new Logger(RegisterService.name);

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly peopleRepository: PeopleRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<IAuthResponse> {
    try {
      this.logger.log(`Intentando registrar usuario: ${registerDto.email}`);
      
      // Crear el usuario usando el servicio existente
      const newUser = await this.createUserService.execute({
        email: registerDto.email,
        password: registerDto.password
      });
      this.logger.log(`Usuario creado con ID: ${newUser._id}`);

      // Crear perfil de persona asociado al usuario
      await this.peopleRepository.create({
        userId: newUser._id,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        studyGoals: []
      });
      this.logger.log(`Perfil de persona creado para usuario: ${newUser._id}`);

      // Generar tokens
      const payload: IJwtPayload = { 
        sub: newUser._id, 
        email: newUser.email 
      };
      
      const secret = this.configService.get<string>('jwt.secret') || 'testflow-secret-key';
      this.logger.debug('Generando access token');
      const accessToken = this.jwtService.sign(payload, { secret });
      
      // Generar refresh token
      this.logger.debug('Generando refresh token');
      const refreshToken = crypto.randomBytes(40).toString('hex');
      const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      const daysString = refreshTokenExpiresIn.replace('d', '');
      const days = parseInt(daysString, 10) || 7;
      expiresAt.setDate(expiresAt.getDate() + days);
      
      // Guardar refresh token
      this.logger.debug('Guardando refresh token en base de datos');
      await this.tokenRepository.create({
        userId: newUser._id,
        token: refreshToken,
        expiresAt,
        used: false,
        type: 'refresh',
      });

      this.logger.log(`Registro completado exitosamente para: ${newUser.email}`);
      return {
        user: {
          _id: newUser._id,
          email: newUser.email,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(`Error en el registro: ${error.message}`, error.stack);
      throw error;
    }
  }
}