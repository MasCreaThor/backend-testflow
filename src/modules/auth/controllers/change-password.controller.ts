// src/modules/auth/controllers/change-password.controller.ts
import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { ChangePasswordService } from '../services/change-password.service';
import { ChangePasswordDto } from '../model/dto/change-password.dto';

@Controller('auth')
export class ChangePasswordController {
  private readonly logger = new Logger(ChangePasswordController.name);

  constructor(private readonly changePasswordService: ChangePasswordService) {}

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    // Extraer el ID del usuario del objeto req.user
    const userId = req.user._id; // Obtener el _id del objeto user completo
    
    this.logger.debug(`Solicitud de cambio de contraseña para usuario: ${JSON.stringify(req.user)}`);
    this.logger.debug(`ID extraído: ${userId}`);
    
    return this.changePasswordService.execute(userId, changePasswordDto);
  }
}