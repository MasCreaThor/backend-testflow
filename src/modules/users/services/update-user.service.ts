// src/modules/users/services/update-user.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories/user.repository';
import { UpdateUserDto } from '../model/dto/update-user.dto';
import { IUser } from '../model/interfaces/user.interface';
import { Helper } from '../../../common/utils';
import { LoggerService } from '../../../shared/services/logger.service';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio para la actualización de usuarios
 */
@Injectable()
export class UpdateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateUserService.name);
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param updateUserDto Datos para actualizar el usuario
   * @returns Usuario actualizado sin la contraseña
   * @throws NotFoundException si el usuario no existe
   * @throws ConflictException si se intenta actualizar a un email ya existente
   * @throws InternalServerErrorException si ocurre un error al procesar la solicitud
   */
  async execute(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<IUser, 'password'>> {
    this.logger.debug(`Ejecutando actualización de usuario ID: ${id}`);
    
    // Verificar si el usuario existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      this.logger.warn(`Usuario con ID ${id} no encontrado`);
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail._id !== id) {
        this.logger.warn(`El email ${updateUserDto.email} ya está en uso por otro usuario`);
        throw new ConflictException('El correo electrónico ya está en uso por otro usuario');
      }
    }

    // Si se está actualizando la contraseña, encriptarla
    let updateData = { ...updateUserDto };
    
    if (updateUserDto.password) {
      try {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      } catch (error) {
        this.logger.error(`Error al hashear contraseña: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Error al procesar la contraseña');
      }
    }

    // Actualizar usuario
    try {
      const updatedUser = await this.userRepository.update(id, updateData);
      if (!updatedUser) {
        this.logger.warn(`No se pudo actualizar el usuario con ID ${id}`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      
      this.logger.log(`Usuario actualizado exitosamente: ${id}`);
      
      // Sanitizar el usuario antes de devolverlo
      return Helper.sanitizeUser(updatedUser) as Omit<IUser, 'password'>;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Error al actualizar usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }
}