// src/modules/roles/controllers/admin-check.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards';
import { UserRoleService } from '../services/user-role.service';
import { JwtUser } from '../decorators/jwt-user.decorator';

@Controller('admin-check')
@UseGuards(JwtAuthGuard)
export class AdminCheckController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get()
  async checkAdminAccess(@JwtUser() user: any) {
    const hasAccess = await this.userRoleService.hasRole(user._id, 'admin');
    return { hasAccess };
  }
}