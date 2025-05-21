// src/modules/roles/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleService } from '../services/user-role.service';
import { ROLES_KEY } from '../decorators/require-role.decorator';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private userRoleService: UserRoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los roles y permisos requeridos del decorador
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const requiredPermissions = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());
    
    // Si no hay requisitos, permitir el acceso
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }
    
    // Obtener el usuario de la solicitud
    const request = context.switchToHttp().getRequest();
    const userId = request.user?._id;
    
    if (!userId) {
      this.logger.warn('Intento de acceso sin usuario autenticado');
      return false;
    }
    
    // Comprobar roles si están especificados
    if (requiredRoles?.length > 0) {
      // Si hay al menos un rol administrativo entre los requeridos
      const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
      if (isAdmin) {
        return true; // Los administradores tienen acceso total
      }
      
      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRequiredRole = await this.userRoleService.hasAnyRole(userId, requiredRoles);
      if (!hasRequiredRole) {
        this.logger.warn(`Usuario ${userId} no tiene los roles requeridos: ${requiredRoles.join(', ')}`);
        return false;
      }
    }
    
    // Comprobar permisos si están especificados
    if (requiredPermissions?.length > 0) {
      // Verificar si el usuario es admin (acceso total)
      const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
      if (isAdmin) {
        return true;
      }
      
      // Verificar si el usuario tiene todos los permisos requeridos
      const hasRequiredPermissions = await this.userRoleService.hasAllPermissions(userId, requiredPermissions);
      if (!hasRequiredPermissions) {
        this.logger.warn(`Usuario ${userId} no tiene los permisos requeridos: ${requiredPermissions.join(', ')}`);
        return false;
      }
    }
    
    return true;
  }
}