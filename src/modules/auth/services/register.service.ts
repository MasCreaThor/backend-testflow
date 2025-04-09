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
import { UserRoleService } from '../../roles/services/user-role.service';
import { RoleService } from '../../roles/services/role.service';
import { 
  InternalServerErrorException, 
  NotFoundException 
} from '../../../common/exceptions/app-exception';

@Injectable()
export class RegisterService {
  private readonly logger = new Logger(RegisterService.name);

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly peopleRepository: PeopleRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<IAuthResponse> {
    try {
      this.logger.log(`Attempting to register user: ${registerDto.email}`);
      
      // Crear el usuario usando el servicio existente
      const newUser = await this.createUserService.execute({
        email: registerDto.email,
        password: registerDto.password
      });
      this.logger.log(`User created with ID: ${newUser._id}`);

      // Crear perfil de persona asociado al usuario
      try {
        await this.peopleRepository.create({
          userId: newUser._id,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          studyGoals: []
        });
        this.logger.log(`Person profile created for user: ${newUser._id}`);
      } catch (error) {
        this.logger.error(`Failed to create person profile: ${error.message}`, error.stack);
        // Since user is already created, we should continue but log the error
        // In a real system, we might want to implement a rollback mechanism
      }

      // Asignar rol "user" por defecto
      try {
        // Buscar el rol "user"
        const userRole = await this.roleService.findByName('user');
        
        // Asignar el rol al usuario recién creado
        await this.userRoleService.assignRole({
          userId: newUser._id,
          roleId: userRole._id,
        });
        
        this.logger.log(`"User" role assigned to user: ${newUser._id}`);
      } catch (error) {
        // If error is our custom NotFoundException, log it appropriately
        if (error instanceof NotFoundException) {
          this.logger.warn(`Default role "user" not found: ${error.message}`);
        } else {
          this.logger.error(`Error assigning default role: ${error.message}`, error.stack);
        }
        // Continue with registration despite role assignment error
      }

      // Generar tokens
      const payload: IJwtPayload = { 
        sub: newUser._id, 
        email: newUser.email 
      };
      
      const secret = this.configService.get<string>('jwt.secret');
      if (!secret) {
        this.logger.error('JWT secret not configured in environment variables');
        throw new InternalServerErrorException(
          'Error de configuración del servidor', 
          'JWT_SECRET_MISSING'
        );
      }
      
      this.logger.debug('Generating access token');
      const accessToken = this.jwtService.sign(payload, { secret });
      
      // Generar refresh token
      this.logger.debug('Generating refresh token');
      const refreshToken = crypto.randomBytes(40).toString('hex');
      const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      const daysString = refreshTokenExpiresIn.replace('d', '');
      const days = parseInt(daysString, 10) || 7;
      expiresAt.setDate(expiresAt.getDate() + days);
      
      // Guardar refresh token
      this.logger.debug('Saving refresh token to database');
      await this.tokenRepository.create({
        userId: newUser._id,
        token: refreshToken,
        expiresAt,
        used: false,
        type: 'refresh',
      });

      this.logger.log(`Registration completed successfully for: ${newUser.email}`);
      return {
        user: {
          _id: newUser._id,
          email: newUser.email,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Re-throw AppExceptions (our custom exceptions)
      if (error.name === 'AppException' || 
          error instanceof InternalServerErrorException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno durante el proceso de registro',
        'REGISTRATION_INTERNAL_ERROR',
        { originalError: error.message }
      );
    }
  }
}