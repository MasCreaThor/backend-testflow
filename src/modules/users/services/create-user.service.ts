// src/modules/users/services/create-user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories';
import { CreateUserDto } from '../model/dto';
import { IUser } from '../model/interfaces';
import { Helper } from '../../../common/utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(createUserDto: CreateUserDto): Promise<Omit<IUser, 'password'>> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear nuevo usuario
    const newUser = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Sanitizar el usuario antes de devolverlo
    return Helper.sanitizeUser(newUser);
  }
}