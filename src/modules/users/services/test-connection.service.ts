// src/modules/users/services/test-connection.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infra/repositories';

@Injectable()
export class TestConnectionService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<{ status: string; message: string }> {
    const isConnected = await this.userRepository.testConnection();
    return {
      status: isConnected ? 'success' : 'error',
      message: isConnected
        ? 'Conexión a MongoDB exitosa'
        : 'No se pudo conectar a MongoDB',
    };
  }
}