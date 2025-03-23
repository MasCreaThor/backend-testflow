// src/modules/roles/decorators/require-role.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles One or more roles required
 */
export const RequireRole = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);