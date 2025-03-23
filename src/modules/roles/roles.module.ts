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
  RoleController,
  PermissionController,
  UserRoleController,
  AdminCheckController
} from './controllers';

// Services
import { 
  RoleService,
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [
    RoleController,
    PermissionController,
    UserRoleController,
    AdminCheckController,
  ],
  providers: [
    // Services
    RoleService,
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
    // Services
    RoleService,
    PermissionService,
    UserRoleService,
    InitRolesService,
    
    // Guards
    RolesGuard,
    PermissionsGuard,
    AdminAccessGuard,
  ],
})
export class RolesModule {}