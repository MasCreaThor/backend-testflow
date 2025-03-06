// src/modules/auth/services/reset-password.service.ts
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { ResetPasswordRequestDto, ResetPasswordDto } from '../model/dto';
import { IUser } from '../../users/model/interfaces';
import { EmailService } from '../../email/services/email.service';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(dto: ResetPasswordRequestDto): Promise<{ message: string }> {
    this.logger.log(`Solicitud de restablecimiento de contraseña para: ${dto.email}`);
    
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Intento de restablecimiento para email no registrado: ${dto.email}`);
      // Por seguridad, no revelamos que el usuario no existe
      return {
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
      };
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

    // Enviar email con el token
    const emailSent = await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name,
    );

    if (!emailSent) {
      this.logger.error(`Error al enviar email de restablecimiento a: ${user.email}`);
      throw new InternalServerErrorException('No se pudo enviar el correo de restablecimiento');
    }

    this.logger.log(`Email de restablecimiento enviado a: ${user.email}`);
    
    return {
      message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  // ESTE ES EL MÉTODO QUE FALTA
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.logger.log(`Intento de restablecimiento de contraseña con token`);
    
    // Verificar si el token existe y es válido
    const tokenRecord = await this.tokenRepository.findByToken(dto.token);
    if (!tokenRecord) {
      this.logger.warn(`Token inválido utilizado: ${dto.token.substring(0, 10)}...`);
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar si el token ha sido usado
    if (tokenRecord.used) {
      this.logger.warn(`Intento de usar token ya utilizado: ${dto.token.substring(0, 10)}...`);
      throw new UnauthorizedException('Este token ya ha sido utilizado');
    }

    // Verificar si el token ha expirado
    if (new Date() > tokenRecord.expiresAt) {
      this.logger.warn(`Intento de usar token expirado: ${dto.token.substring(0, 10)}...`);
      throw new UnauthorizedException('Token expirado');
    }

    // Buscar el usuario
    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      this.logger.error(`Usuario no encontrado para token: ${dto.token.substring(0, 10)}...`);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      this.logger.warn(`Intento de establecer la misma contraseña para usuario: ${user.email}`);
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Actualizar contraseña del usuario
    await this.userRepository.update(user._id, { password: hashedPassword });

    // Marcar el token como usado
    await this.tokenRepository.markAsUsed(tokenRecord._id);

    this.logger.log(`Contraseña restablecida con éxito para usuario: ${user.email}`);
    
    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}