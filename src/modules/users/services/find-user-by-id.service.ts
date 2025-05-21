// src/modules/users/services/find-user-by-id.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../infra/repositories';
import { IUser } from '../model/interfaces';

@Injectable()
export class FindUserByIdService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }
}