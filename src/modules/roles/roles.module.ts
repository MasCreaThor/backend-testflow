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
  UserRoleController
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
import { RolesGuard, PermissionsGuard } from './guards';

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
  ],
})
export class RolesModule {}