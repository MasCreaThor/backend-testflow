// src/health/controllers/diagnostic.controller.ts
import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards';
import { DatabaseHealthService } from '../services/database-health.service';

@Controller('diagnostic')
export class DiagnosticController {
  private readonly logger = new Logger(DiagnosticController.name);

  constructor(private readonly dbHealthService: DatabaseHealthService) {}

  @Get('database')
  @UseGuards(JwtAuthGuard) // Protegemos esta ruta para que solo usuarios autenticados puedan acceder
  async checkDatabaseConnection() {
    this.logger.log('Ejecutando diagnóstico completo de la base de datos');
    return this.dbHealthService.runDiagnostics();
  }
}