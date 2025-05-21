// src/health/controllers/health.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { DatabaseHealthService } from '../services/database-health.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly dbHealth: DatabaseHealthService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    this.logger.log('Realizando health check del sistema');
    return this.health.check([
      () => this.dbHealth.checkMongoDB('mongodb'),
    ]);
  }

  @Get('database')
  @HealthCheck()
  async checkDatabase(): Promise<HealthCheckResult> {
    this.logger.log('Realizando health check específico de la base de datos');
    return this.health.check([
      () => this.dbHealth.checkMongoDB('mongodb'),
    ]);
  }
}