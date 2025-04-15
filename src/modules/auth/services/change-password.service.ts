// src/modules/auth/services/change-password.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../users/infra/repositories';
import { ChangePasswordDto } from '../model/dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { 
  UnauthorizedException, 
  BadRequestException,
  NotFoundException,
  InternalServerErrorException 
} from '../../../common/exceptions/app-exception';

@Injectable()
export class ChangePasswordService {
  private readonly logger = new Logger(ChangePasswordService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      this.logger.log(`Attempting to change password for user ID: ${userId}`);
      
      // Buscar al usuario por ID
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found during password change`);
        throw new NotFoundException(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          { userId }
        );
      }

      this.logger.debug(`User found for password change: ${user.email}`);

      // Verificar la contraseña actual
      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        this.logger.warn(`Incorrect current password provided for user: ${user.email}`);
        throw new UnauthorizedException(
          'La contraseña actual no es correcta',
          'INVALID_CURRENT_PASSWORD'
        );
      }

      // Verificar que la nueva contraseña sea diferente a la actual
      const isSamePassword = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password
      );

      if (isSamePassword) {
        this.logger.warn(`User tried to set the same password: ${user.email}`);
        throw new BadRequestException(
          'La nueva contraseña debe ser diferente a la actual',
          'SAME_PASSWORD'
        );
      }

      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

      // Actualizar la contraseña del usuario
      await this.userRepository.update(userId, { password: hashedPassword });
      
      this.logger.log(`Password successfully updated for user: ${user.email}`);

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof UnauthorizedException || 
          error instanceof BadRequestException ||
          error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error changing password: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al cambiar la contraseña',
        'PASSWORD_CHANGE_ERROR',
        { originalError: error.message }
      );
    }
  }
}