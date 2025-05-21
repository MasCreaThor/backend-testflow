// src/modules/users/routes/user.routes.ts
import { Routes } from '@nestjs/core';
import { UsersModule } from '../users.module';

export const userRoutes: Routes = [
  {
    path: 'users',
    module: UsersModule,
  },
];