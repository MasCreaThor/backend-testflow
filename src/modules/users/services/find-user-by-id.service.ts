// src/modules/users/services/find-user-by-id.service.ts
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
export class FindUserByIdService {
  private readonly logger = new Logger(FindUserByIdService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<IUser> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`);
      
      // Validate ID format
      if (!Helper.isValidObjectId(id)) {
        this.logger.warn(`Invalid user ID format: ${id}`);
        throw new BadRequestException(
          'ID de usuario inválido',
          'INVALID_USER_ID'
        );
      }
      
      const user = await this.userRepository.findById(id);
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(
          `Usuario con ID ${id} no encontrado`,
          'USER_NOT_FOUND',
          { userId: id }
        );
      }
      
      this.logger.debug(`User found: ${user.email}`);
      return user;
    } catch (error) {
      // Re-throw AppExceptions
      if (error.name === 'AppException' || 
          error instanceof NotFoundException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error finding user by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Error interno al buscar el usuario',
        'USER_FIND_ERROR',
        { originalError: error.message, userId: id }
      );
    }
  }
}