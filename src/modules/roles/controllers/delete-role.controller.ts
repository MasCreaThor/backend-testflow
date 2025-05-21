// src/modules/roles/controllers/delete-role.controller.ts
import { Controller, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { DeleteRoleService } from '../services';
import { LoggerService } from '../../../shared/services/logger.service';

/**
 * Controlador para eliminar roles
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeleteRoleController {
  constructor(
    private readonly deleteRoleService: DeleteRoleService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(DeleteRoleController.name);
  }

  /**
   * Elimina un rol existente
   * @param id ID del rol a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('roles:delete')
  async handle(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando rol con ID: ${id}`);
    await this.deleteRoleService.execute(id);
    return { message: 'Rol eliminado con éxito' };
  }
}