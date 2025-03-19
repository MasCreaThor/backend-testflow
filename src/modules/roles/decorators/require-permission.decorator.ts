// src/modules/roles/decorators/require-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions One or more permissions required
 */
export const RequirePermission = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);