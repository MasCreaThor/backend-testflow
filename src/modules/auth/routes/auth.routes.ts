// src/modules/auth/routes/auth.routes.ts
import { Routes } from '@nestjs/core';
import { AuthModule } from '../auth.module';

export const authRoutes: Routes = [
  {
    path: 'auth',
    module: AuthModule,
  },
];