// src/modules/users/services/create-user.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../infra/repositories/user.repository';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { IUser } from '../model/interfaces/user.interface';
import { Helper } from '../../../common/utils';
import * as bcrypt from 'bcryptjs';
import { 
  ConflictException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';

@Injectable()
export class CreateUserService {
  private readonly logger = new Logger(CreateUserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    createUserDto: CreateUserDto,
  ): Promise<Omit<IUser, 'password'>> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);
      
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(
        createUserDto.email,
      );
      
      if (existingUser) {
        this.logger.warn(`Email already registered: ${createUserDto.email}`);
        throw new ConflictException(
          'El correo electrónico ya está registrado',
          'EMAIL_ALREADY_REGISTERED',
          { email: createUserDto.email }
        );
      }

      // Encriptar contraseña
      let hashedPassword: string;
      try {
        hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        this.logger.debug(`Password hashed successfully for: ${createUserDto.email}`);
      } catch (error) {
        this.logger.error(`Error hashing password: ${error.message}`, error.stack);
        throw new InternalServerErrorException(
          'Error al encriptar la contraseña',
          'PASSWORD_HASHING_ERROR'
        );
      }

      // Crear nuevo usuario
      const newUser = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      
      this.logger.log(`User created successfully with ID: ${newUser._id}`);

      // Sanitizar el usuario antes de devolverlo
      return Helper.sanitizeUser(newUser) as Omit<IUser, 'password'>;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof ConflictException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al crear el usuario',
        'USER_CREATION_ERROR',
        { originalError: error.message }
      );
    }
  }
}