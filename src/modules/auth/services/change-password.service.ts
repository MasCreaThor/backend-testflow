// src/modules/auth/services/change-password.service.ts
import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { UserRepository } from '../../users/infra/repositories';
import { ChangePasswordDto } from '../model/dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordService {
  private readonly logger = new Logger(ChangePasswordService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    this.logger.log(`Intentando cambiar contraseña para usuario con ID: ${userId}`);
    
    // Buscar al usuario por ID
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      this.logger.error(`Usuario con ID ${userId} no encontrado`);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    this.logger.log(`Usuario encontrado: ${user.email}`);

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      this.logger.warn(`Contraseña actual incorrecta para usuario: ${user.email}`);
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password
    );

    if (isSamePassword) {
      this.logger.warn(`Intento de establecer la misma contraseña para usuario: ${user.email}`);
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Actualizar la contraseña del usuario
    await this.userRepository.update(userId, { password: hashedPassword });
    
    this.logger.log(`Contraseña actualizada con éxito para usuario: ${user.email}`);

    return { message: 'Contraseña actualizada correctamente' };
  }
}