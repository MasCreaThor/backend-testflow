// src/modules/roles/controllers/update-role.controller.ts
import { Controller, Put, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { UpdateRoleService } from '../services';
import { UpdateRoleDto } from '../infra/model/dto';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para actualizar roles
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateRoleController {
  constructor(
    private readonly updateRoleService: UpdateRoleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateRoleController.name);
  }

  /**
   * Actualiza un rol existente
   * @param id ID del rol a actualizar
   * @param updateRoleDto Datos para la actualización
   * @returns Rol actualizado
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:update')
  async handle(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<IRole> {
    this.logger.log(`Actualizando rol con ID: ${id}`);
    return this.updateRoleService.execute(id, updateRoleDto);
  }
}