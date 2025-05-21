// src/modules/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { 
  Role,
  RoleSchema,
  Permission,
  PermissionSchema,
  UserRole,
  UserRoleSchema
} from './infra/schemas';

// Controllers
import { 
  FindAllRolesController,
  FindRoleByIdController,
  FindRoleByNameController,
  CreateRoleController,
  UpdateRoleController,
  DeleteRoleController,
  AddPermissionToRoleController,
  RemovePermissionFromRoleController,
  PermissionController,
  UserRoleController,
  AdminCheckController
} from './controllers';

// Services
import { 
  FindAllRolesService,
  FindRoleByIdService,
  FindRoleByNameService,
  CreateRoleService,
  UpdateRoleService,
  DeleteRoleService,
  AddPermissionToRoleService,
  RemovePermissionFromRoleService,
  PermissionService,
  UserRoleService,
  InitRolesService
} from './services';

// Repositories
import { 
  RoleRepository,
  PermissionRepository,
  UserRoleRepository
} from './infra/repositories';

// Guards
import { RolesGuard, PermissionsGuard, AdminAccessGuard } from './guards';

import { LoggerService } from '../../shared/services/logger.service';

/**
 * Módulo de roles y permisos
 * 
 * Proporciona funcionalidad para la gestión de roles, permisos
 * y asignaciones de roles a usuarios, así como guardias para
 * protección de rutas basada en roles y permisos.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [
    FindAllRolesController,
    FindRoleByIdController,
    FindRoleByNameController,
    CreateRoleController,
    UpdateRoleController,
    DeleteRoleController,
    AddPermissionToRoleController,
    RemovePermissionFromRoleController,
    PermissionController,
    UserRoleController,
    AdminCheckController,
  ],
  providers: [
    LoggerService,
    
    // Services
    FindAllRolesService,
    FindRoleByIdService,
    FindRoleByNameService,
    CreateRoleService,
    UpdateRoleService,
    DeleteRoleService,
    AddPermissionToRoleService,
    RemovePermissionFromRoleService,
    PermissionService,
    UserRoleService,
    InitRolesService,
    
    // Repositories
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    
    // Guards
    RolesGuard,
    PermissionsGuard,
    AdminAccessGuard,
  ],
  exports: [
    // Exportar servicios específicos que otros módulos necesitan
    FindRoleByNameService,
    FindAllRolesService,
    UserRoleService,
    PermissionService,
    InitRolesService,
    
    // Guards
    RolesGuard,
    PermissionsGuard,
    AdminAccessGuard,
  ],
})
export class RolesModule {}