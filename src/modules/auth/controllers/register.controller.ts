// src/modules/auth/controllers/register.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from '../services';
import { RegisterDto } from '../model/dto';
import { IAuthResponse } from '../model/interfaces';

@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('register')
  async handle(@Body() registerDto: RegisterDto): Promise<IAuthResponse> {
    return this.registerService.execute(registerDto);
  }
}