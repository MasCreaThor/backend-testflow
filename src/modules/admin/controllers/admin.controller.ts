// src/modules/admin/controllers/admin.controller.ts
import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards';
import { AdminAccessGuard } from '../../roles/guards/admin-access.guard';
import { AdminService } from '../services/admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    this.logger.log('Obteniendo estadísticas del sistema');
    return this.adminService.getStats();
  }
}