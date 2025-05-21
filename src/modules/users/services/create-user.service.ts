// src/modules/users/services/create-user.service.ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories/user.repository';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { IUser } from '../model/interfaces/user.interface';
import { Helper } from '../../../common/utils';
import { LoggerService } from '../../../shared/services/logger.service';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio para la creación de usuarios
 */
@Injectable()
export class CreateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreateUserService.name);
  }

  /**
   * Crea un nuevo usuario
   * @param createUserDto Datos para la creación del usuario
   * @returns Usuario creado sin la contraseña
   * @throws ConflictException si el email ya está registrado
   * @throws InternalServerErrorException si hay un error al hashear la contraseña
   */
  async execute(
    createUserDto: CreateUserDto,
  ): Promise<Omit<IUser, 'password'>> {
    this.logger.debug(`Ejecutando creación de usuario: ${createUserDto.email}`);
    
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    
    if (existingUser) {
      this.logger.warn(`Email ya registrado: ${createUserDto.email}`);
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Encriptar contraseña
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    } catch (error) {
      this.logger.error(`Error al hashear contraseña: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al procesar la contraseña');
    }

    // Crear nuevo usuario
    try {
      const newUser = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      this.logger.log(`Usuario creado exitosamente: ${newUser._id}`);
      
      // Sanitizar el usuario antes de devolverlo
      return Helper.sanitizeUser(newUser) as Omit<IUser, 'password'>;
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }
}