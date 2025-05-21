// src/modules/people/controllers/delete-people.controller.ts
import { Controller, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { DeletePeopleService } from '../services';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para eliminar perfiles de personas
 */
@Controller('people')
@UseGuards(JwtAuthGuard)
export class DeletePeopleController {
  constructor(
    private readonly deletePeopleService: DeletePeopleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeletePeopleController.name);
  }

  /**
   * Elimina un perfil de persona existente
   * @param id ID del perfil a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando perfil de persona con ID: ${id}`);
    await this.deletePeopleService.execute(id);
    return { message: 'Perfil de persona eliminado con éxito' };
  }
}