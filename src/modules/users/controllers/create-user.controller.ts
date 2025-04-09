// src/modules/users/controllers/create-user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserService } from '../services';
import { CreateUserDto } from '../model/dto';

@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  async handle(@Body() createUserDto: CreateUserDto) {
    return this.createUserService.execute(createUserDto);
  }
}
