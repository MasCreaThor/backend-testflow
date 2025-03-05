// src/modules/users/services/find-all-users.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infra/repositories';
import { IUser } from '../model/interfaces';

@Injectable()
export class FindAllUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }
}