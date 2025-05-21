// src/modules/auth/services/register.service.ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { CreateUserService } from '../../users/services';
import { PeopleRepository } from '../../people/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { RegisterDto } from '../model/dto';
import { IAuthResponse, IJwtPayload } from '../model/interfaces';
import { UserRoleService } from '../../roles/services/user-role.service';
import { FindRoleByNameService } from '../../roles/services/find-role-by-name.service';
import { SendWelcomeEmailService } from '../../email/services';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Servicio para el registro de nuevos usuarios
 */
@Injectable()
export class RegisterService {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly peopleRepository: PeopleRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRoleService: UserRoleService,
    private readonly findRoleByNameService: FindRoleByNameService,
    private readonly sendWelcomeEmailService: SendWelcomeEmailService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(RegisterService.name);
  }

  /**
   * Procesa el registro de un nuevo usuario
   * @param registerDto Datos para el registro
   * @returns Respuesta de autenticación con tokens y usuario
   * @throws ConflictException si el email ya está registrado
   * @throws InternalServerErrorException si ocurre un error durante el proceso
   */
  async execute(registerDto: RegisterDto): Promise<IAuthResponse> {
    try {
      this.logger.log(`Procesando registro para usuario: ${registerDto.email}`);
      
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

      // Asignar rol "user" por defecto
      try {
        // Buscar el rol "user"
        const userRole = await this.findRoleByNameService.execute('user');
        
        // Asignar el rol al usuario recién creado
        await this.userRoleService.assignRole({
          userId: newUser._id,
          roleId: userRole._id,
        });
        
        this.logger.log(`Rol "user" asignado automáticamente al usuario: ${newUser._id}`);
      } catch (error) {
        this.logger.error(`Error al asignar el rol por defecto: ${error.message}`, error.stack);
        // Continuamos con el registro a pesar del error en la asignación de rol
      }

      // Enviar email de bienvenida
      this.sendWelcomeEmailService.execute(
        registerDto.email,
        `${registerDto.firstName} ${registerDto.lastName}`
      ).catch(error => {
        this.logger.error(`Error al enviar email de bienvenida: ${error.message}`, error.stack);
        // No bloqueamos el registro si falla el envío del email
      });

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
      // Propagar errores de conflicto (como email duplicado)
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error en el registro: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error en el proceso de registro');
    }
  }
}