// src/modules/roles/controllers/remove-permission-from-role.controller.ts
import { Controller, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { RemovePermissionFromRoleService } from '../services';
import { IRole } from '../infra/model/interfaces';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para eliminar un permiso de un rol
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RemovePermissionFromRoleController {
  constructor(
    private readonly removePermissionFromRoleService: RemovePermissionFromRoleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(RemovePermissionFromRoleController.name);
  }

  /**
   * Elimina un permiso de un rol
   * @param id ID del rol
   * @param permissionName Nombre del permiso
   * @returns Rol actualizado
   */
  @Delete(':id/permissions/:permissionName')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:update')
  async handle(
    @Param('id') id: string,
    @Param('permissionName') permissionName: string
  ): Promise<IRole> {
    this.logger.log(`Eliminando permiso ${permissionName} del rol ${id}`);
    return this.removePermissionFromRoleService.execute(id, permissionName);
  }
}