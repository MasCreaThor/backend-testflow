// src/modules/roles/controllers/find-role-by-id.controller.ts
import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { FindRoleByIdService } from '../services';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener un rol por su ID
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindRoleByIdController {
  constructor(
    private readonly findRoleByIdService: FindRoleByIdService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindRoleByIdController.name);
  }

  /**
   * Obtiene un rol por su ID
   * @param id ID del rol
   * @returns Rol encontrado
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:read')
  async handle(@Param('id') id: string): Promise<IRole> {
    this.logger.log(`Obteniendo rol con ID: ${id}`);
    return this.findRoleByIdService.execute(id);
  }
}