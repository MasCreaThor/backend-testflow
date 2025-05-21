// src/modules/people/controllers/find-people-by-user-id.controller.ts
import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FindPeopleByUserIdService } from '../services';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener un perfil de persona por su ID de usuario
 */
@Controller('people')
@UseGuards(JwtAuthGuard)
export class FindPeopleByUserIdController {
  constructor(
    private readonly findPeopleByUserIdService: FindPeopleByUserIdService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindPeopleByUserIdController.name);
  }

  /**
   * Obtiene un perfil de persona por su ID de usuario
   * @param userId ID del usuario
   * @returns Perfil de persona encontrado
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('userId') userId: string): Promise<IPeople> {
    this.logger.log(`Obteniendo perfil de persona para usuario con ID: ${userId}`);
    return this.findPeopleByUserIdService.execute(userId);
  }
}