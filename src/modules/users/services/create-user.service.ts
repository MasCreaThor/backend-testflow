// src/modules/users/services/create-user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories/user.repository';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { IUser } from '../model/interfaces/user.interface';
import { Helper } from '../../../common/utils';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    createUserDto: CreateUserDto,
  ): Promise<Omit<IUser, 'password'>> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Encriptar contraseña
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    } catch {
      throw new Error('Error hashing password');
    }

    // Crear nuevo usuario
    const newUser = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Sanitizar el usuario antes de devolverlo
    return Helper.sanitizeUser(newUser) as Omit<IUser, 'password'>;
  }
}
