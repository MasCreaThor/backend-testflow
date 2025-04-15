// src/modules/users/services/update-last-login.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../infra/repositories';
import { IUser } from '../model/interfaces';
import { 
  NotFoundException,
  InternalServerErrorException,
  BadRequestException 
} from '../../../common/exceptions/app-exception';
import { Helper } from '../../../common/utils';

@Injectable()
export class UpdateLastLoginService {
  private readonly logger = new Logger(UpdateLastLoginService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<IUser> {
    try {
      this.logger.debug(`Updating last login for user: ${userId}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(userId)) {
        this.logger.warn(`Invalid user ID format: ${userId}`);
        throw new BadRequestException(
          'ID de usuario inválido',
          'INVALID_USER_ID'
        );
      }
      
      const updatedUser = await this.userRepository.updateLastLogin(userId);
      if (!updatedUser) {
        this.logger.warn(`User with ID ${userId} not found during last login update`);
        throw new NotFoundException(
          `Usuario con ID ${userId} no encontrado`,
          'USER_NOT_FOUND',
          { userId }
        );
      }
      
      this.logger.debug(`Last login timestamp updated for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error updating last login: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al actualizar el último inicio de sesión',
        'UPDATE_LAST_LOGIN_ERROR',
        { originalError: error.message, userId }
      );
    }
  }
}