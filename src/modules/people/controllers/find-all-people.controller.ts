// src/modules/people/controllers/find-all-people.controller.ts
import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FindAllPeopleService } from '../services';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener todos los perfiles de personas
 */
@Controller('people')
@UseGuards(JwtAuthGuard)
export class FindAllPeopleController {
  constructor(
    private readonly findAllPeopleService: FindAllPeopleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindAllPeopleController.name);
  }

  /**
   * Obtiene todos los perfiles de personas
   * @returns Lista de perfiles de personas
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async handle(): Promise<IPeople[]> {
    this.logger.log('Obteniendo todos los perfiles de personas');
    return this.findAllPeopleService.execute();
  }
}