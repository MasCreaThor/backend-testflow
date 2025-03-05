// src/modules/users/services/update-last-login.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories';
import { IUser } from '../model/interfaces';

@Injectable()
export class UpdateLastLoginService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<IUser> {
    const updatedUser = await this.userRepository.updateLastLogin(userId);
    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return updatedUser;
  }
}