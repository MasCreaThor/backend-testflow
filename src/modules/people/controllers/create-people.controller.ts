// src/modules/people/controllers/create-people.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CreatePeopleService } from '../services';
import { CreatePeopleDto } from '../model/dto';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para crear perfiles de personas
 */
@Controller('people')
@UseGuards(JwtAuthGuard)
export class CreatePeopleController {
  constructor(
    private readonly createPeopleService: CreatePeopleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreatePeopleController.name);
  }

  /**
   * Crea un nuevo perfil de persona
   * @param createPeopleDto Datos para la creación
   * @returns Perfil de persona creado
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body() createPeopleDto: CreatePeopleDto): Promise<IPeople> {
    this.logger.log(`Creando nuevo perfil de persona para usuario: ${createPeopleDto.userId}`);
    return this.createPeopleService.execute(createPeopleDto);
  }
}