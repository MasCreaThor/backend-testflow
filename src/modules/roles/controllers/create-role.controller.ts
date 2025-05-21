// src/modules/roles/controllers/create-role.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CreateRoleService } from '../services';
import { CreateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para crear roles
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateRoleController {
  constructor(
    private readonly createRoleService: CreateRoleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(CreateRoleController.name);
  }

  /**
   * Crea un nuevo rol
   * @param createRoleDto Datos para la creación
   * @returns Rol creado
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('roles:create')
  async handle(@Body() createRoleDto: CreateRoleDto): Promise<IRole> {
    this.logger.log(`Creando nuevo rol: ${createRoleDto.name}`);
    return this.createRoleService.execute(createRoleDto);
  }
}