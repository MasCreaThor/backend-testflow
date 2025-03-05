// src/modules/auth/controllers/login.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from '../services';
import { LoginDto } from '../model/dto';
import { IAuthResponse } from '../model/interfaces';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async handle(@Body() loginDto: LoginDto): Promise<IAuthResponse> {
    return this.loginService.execute(loginDto);
  }
}