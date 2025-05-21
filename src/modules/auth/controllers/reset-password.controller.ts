// src/modules/auth/controllers/reset-password.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ResetPasswordService } from '../services';
import { ResetPasswordRequestDto, ResetPasswordDto } from '../model/dto';

@Controller('auth')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: ResetPasswordRequestDto) {
    return this.resetPasswordService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordService.resetPassword(dto);
  }
}