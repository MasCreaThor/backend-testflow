// src/modules/roles/controllers/add-permission-to-role.controller.ts
import { Controller, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { AddPermissionToRoleService } from '../services';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para agregar un permiso a un rol
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddPermissionToRoleController {
  constructor(
    private readonly addPermissionToRoleService: AddPermissionToRoleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(AddPermissionToRoleController.name);
  }

  /**
   * Agrega un permiso a un rol
   * @param id ID del rol
   * @param permissionName Nombre del permiso
   * @returns Rol actualizado
   */
  @Post(':id/permissions/:permissionName')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:update')
  async handle(
    @Param('id') id: string,
    @Param('permissionName') permissionName: string
  ): Promise<IRole> {
    this.logger.log(`Agregando permiso ${permissionName} al rol ${id}`);
    return this.addPermissionToRoleService.execute(id, permissionName);
  }
}