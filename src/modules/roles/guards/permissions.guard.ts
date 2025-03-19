// src/modules/roles/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleService } from '../services/user-role.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private userRoleService: UserRoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    
    if (!requiredPermissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const userId = request.user?._id;
    
    if (!userId) {
      this.logger.warn('Intento de acceso sin usuario autenticado');
      return false;
    }
    
    // Verificar si el usuario es admin (acceso total)
    const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
    if (isAdmin) {
      return true;
    }
    
    // Comprobar si el usuario tiene todos los permisos requeridos
    const hasAllPermissions = await this.userRoleService.hasAllPermissions(
      userId,
      requiredPermissions,
    );
    
    if (!hasAllPermissions) {
      this.logger.warn(
        `Usuario ${userId} no tiene los permisos requeridos: ${requiredPermissions.join(', ')}`,
      );
    }
    
    return hasAllPermissions;
  }
}