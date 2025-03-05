// src/modules/auth/services/reset-password.service.ts
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { ResetPasswordRequestDto, ResetPasswordDto } from '../model/dto';
import { IUser } from '../../users/model/interfaces';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async requestPasswordReset(dto: ResetPasswordRequestDto): Promise<{ message: string }> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Eliminar tokens de reset anteriores
    await this.tokenRepository.deleteUserTokens(user._id, 'reset');

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora de expiración
    
    // Guardar token de reset
    await this.tokenRepository.create({
      userId: user._id,
      token: resetToken,
      expiresAt,
      used: false,
      type: 'reset',
    });

    // Aquí normalmente se enviaría un email con el token de reset
    // Pero para fines de la implementación, simplemente retornamos el token
    
    // En producción NO devolver el token en la respuesta
    // Solo para fines de prueba/desarrollo
    return {
      message: `Se ha enviado un correo con instrucciones para restablecer la contraseña. Token: ${resetToken}`,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Verificar si el token existe y es válido
    const tokenRecord = await this.tokenRepository.findByToken(dto.token);
    if (!tokenRecord) {
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar si el token ha sido usado
    if (tokenRecord.used) {
      throw new UnauthorizedException('Este token ya ha sido utilizado');
    }

    // Verificar si el token ha expirado
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Token expirado');
    }

    // Buscar el usuario
    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Actualizar contraseña del usuario
    await this.userRepository.update(user._id, { password: hashedPassword });

    // Marcar el token como usado
    await this.tokenRepository.markAsUsed(tokenRecord._id);

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}