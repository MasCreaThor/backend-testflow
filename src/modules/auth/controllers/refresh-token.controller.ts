// src/modules/auth/controllers/refresh-token.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { RefreshTokenService } from '../services';
import { RefreshTokenDto } from '../model/dto';
import { IAuthResponse } from '../model/interfaces';

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh-token')
  async handle(@Body() refreshTokenDto: RefreshTokenDto): Promise<IAuthResponse> {
    return this.refreshTokenService.execute(refreshTokenDto);
  }
}