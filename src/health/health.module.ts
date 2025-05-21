// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';

import { HealthController } from './controllers/health.controller';
import { DiagnosticController } from './controllers/diagnostic.controller';
import { DatabaseHealthService } from './services/database-health.service';

@Module({
  imports: [
    TerminusModule,
    MongooseModule,
  ],
  controllers: [HealthController, DiagnosticController],
  providers: [DatabaseHealthService],
  exports: [DatabaseHealthService],
})
export class HealthModule {}