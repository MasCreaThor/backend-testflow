// src/modules/roles/guards/admin-access.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRoleService } from '../services/user-role.service';

@Injectable()
export class AdminAccessGuard implements CanActivate {
  private readonly logger = new Logger(AdminAccessGuard.name);

  constructor(private readonly userRoleService: UserRoleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?._id;

    if (!userId) {
      this.logger.warn('Intento de acceso a ruta admin sin autenticación');
      throw new UnauthorizedException('Acceso no autorizado');
    }

    // Verificar si el usuario tiene rol de administrador
    const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
    
    if (!isAdmin) {
      this.logger.warn(`Usuario ${userId} intentó acceder a ruta admin sin privilegios`);
      throw new UnauthorizedException('No tienes permisos de administrador para acceder a este recurso');
    }

    return true;
  }
}