// src/modules/roles/controllers/find-all-roles.controller.ts
import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { FindAllRolesService } from '../services';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para obtener todos los roles
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindAllRolesController {
  constructor(
    private readonly findAllRolesService: FindAllRolesService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(FindAllRolesController.name);
  }

  /**
   * Obtiene todos los roles
   * @param activeOnly Filtrar solo roles activos
   * @returns Lista de roles
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:list')
  async handle(@Query('activeOnly') activeOnly: boolean = false): Promise<IRole[]> {
    this.logger.log(`Obteniendo todos los roles. activeOnly=${activeOnly}`);
    return this.findAllRolesService.execute(activeOnly);
  }
}