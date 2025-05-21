// src/modules/people/controllers/update-people.controller.ts
import { Controller, Put, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UpdatePeopleService } from '../services';
import { UpdatePeopleDto } from '../model/dto';
import { IPeople } from '../model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para actualizar perfiles de personas
 */
@Controller('people')
@UseGuards(JwtAuthGuard)
export class UpdatePeopleController {
  constructor(
    private readonly updatePeopleService: UpdatePeopleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdatePeopleController.name);
  }

  /**
   * Actualiza un perfil de persona existente
   * @param id ID del perfil a actualizar
   * @param updatePeopleDto Datos para la actualización
   * @returns Perfil de persona actualizado
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Param('id') id: string,
    @Body() updatePeopleDto: UpdatePeopleDto
  ): Promise<IPeople> {
    this.logger.log(`Actualizando perfil de persona con ID: ${id}`);
    return this.updatePeopleService.execute(id, updatePeopleDto);
  }
}