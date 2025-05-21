// src/modules/roles/controllers/find-role-by-name.controller.ts
import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { FindRoleByNameService } from '../services';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener un rol por su nombre
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindRoleByNameController {
  constructor(
    private readonly findRoleByNameService: FindRoleByNameService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindRoleByNameController.name);
  }

  /**
   * Obtiene un rol por su nombre
   * @param name Nombre del rol
   * @returns Rol encontrado
   */
  @Get('name/:name')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:read')
  async handle(@Param('name') name: string): Promise<IRole> {
    this.logger.log(`Obteniendo rol con nombre: ${name}`);
    return this.findRoleByNameService.execute(name);
  }
}