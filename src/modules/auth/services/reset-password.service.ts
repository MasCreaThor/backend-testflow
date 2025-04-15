// src/modules/auth/services/reset-password.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserRepository } from '../../users/infra/repositories';
import { PeopleRepository } from '../../people/infra/repositories';
import { TokenRepository } from '../infra/repositories';
import { ResetPasswordRequestDto, ResetPasswordDto } from '../model/dto';
import { EmailService } from '../../email/services/email.service';
import { 
  NotFoundException, 
  UnauthorizedException, 
  BadRequestException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly peopleRepository: PeopleRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(dto: ResetPasswordRequestDto): Promise<{ message: string }> {
    try {
      this.logger.log(`Password reset request received for email: ${dto.email}`);
      
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(dto.email);
      if (!user) {
        this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
        // For security, don't reveal that the user doesn't exist
        return {
          message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
        };
      }

      // Buscar el perfil de persona asociado al usuario
      const personProfile = await this.peopleRepository.findByUserId(user._id);
      const fullName = personProfile 
        ? `${personProfile.firstName} ${personProfile.lastName}` 
        : 'Usuario';

      // Eliminar tokens de reset anteriores
      try {
        await this.tokenRepository.deleteUserTokens(user._id, 'reset');
        this.logger.debug(`Deleted previous reset tokens for user: ${user._id}`);
      } catch (error) {
        // Non-critical, just log it
        this.logger.warn(`Failed to delete previous reset tokens: ${error.message}`);
      }

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
      this.logger.debug(`Created reset token for user: ${user._id}`);

      // Enviar email con el token
      const emailSent = await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        fullName,
      );

      if (!emailSent) {
        this.logger.error(`Failed to send reset email to: ${user.email}`);
        throw new InternalServerErrorException(
          'No se pudo enviar el correo de restablecimiento',
          'EMAIL_SENDING_FAILED'
        );
      }

      this.logger.log(`Reset email sent successfully to: ${user.email}`);
      
      return {
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
      };
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      this.logger.error(`Password reset request error: ${error.message}`, error.stack);
      // For security, don't expose details about the error
      return {
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
      };
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      this.logger.log(`Processing password reset with token`);
      
      // Verificar si el token existe y es válido
      const tokenRecord = await this.tokenRepository.findByToken(dto.token);
      if (!tokenRecord) {
        this.logger.warn(`Invalid reset token used: ${dto.token.substring(0, 10)}...`);
        throw new UnauthorizedException(
          'Token inválido',
          'INVALID_RESET_TOKEN'
        );
      }

      // Verificar si el token ha sido usado
      if (tokenRecord.used) {
        this.logger.warn(`Attempt to use already used token: ${tokenRecord._id}`);
        throw new UnauthorizedException(
          'Este token ya ha sido utilizado',
          'TOKEN_ALREADY_USED'
        );
      }

      // Verificar si el token ha expirado
      if (new Date() > tokenRecord.expiresAt) {
        this.logger.warn(`Attempt to use expired token: ${tokenRecord._id}`);
        throw new UnauthorizedException(
          'Token expirado',
          'TOKEN_EXPIRED'
        );
      }

      // Buscar el usuario
      const user = await this.userRepository.findById(tokenRecord.userId);
      if (!user) {
        this.logger.error(`User not found for token: ${tokenRecord.userId}`);
        throw new UnauthorizedException(
          'Usuario no encontrado',
          'USER_NOT_FOUND'
        );
      }

      // Verificar que la nueva contraseña sea diferente a la actual
      const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
      if (isSamePassword) {
        this.logger.warn(`Attempt to set the same password for user: ${user.email}`);
        throw new BadRequestException(
          'La nueva contraseña debe ser diferente a la actual',
          'SAME_PASSWORD'
        );
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      // Actualizar contraseña del usuario
      await this.userRepository.update(user._id, { password: hashedPassword });
      this.logger.debug(`Updated password for user: ${user._id}`);

      // Marcar el token como usado
      await this.tokenRepository.markAsUsed(tokenRecord._id);
      this.logger.debug(`Marked reset token as used: ${tokenRecord._id}`);

      this.logger.log(`Password reset successful for user: ${user.email}`);
      
      return {
        message: 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof UnauthorizedException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Password reset error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error al restablecer la contraseña',
        'PASSWORD_RESET_ERROR',
        { originalError: error.message }
      );
    }
  }
}