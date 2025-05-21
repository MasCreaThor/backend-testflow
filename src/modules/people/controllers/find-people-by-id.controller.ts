// src/modules/people/controllers/find-people-by-id.controller.ts
import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FindPeopleByIdService } from '../services';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener un perfil de persona por su ID
 */
@Controller('people')
@UseGuards(JwtAuthGuard)
export class FindPeopleByIdController {
  constructor(
    private readonly findPeopleByIdService: FindPeopleByIdService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindPeopleByIdController.name);
  }

  /**
   * Obtiene un perfil de persona por su ID
   * @param id ID del perfil
   * @returns Perfil de persona encontrado
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<IPeople> {
    this.logger.log(`Obteniendo perfil de persona con ID: ${id}`);
    return this.findPeopleByIdService.execute(id);
  }
}