// src/modules/users/controllers/create-user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
// import { JwtAuthGuard } from '../../../common/guards';
import { CreateUserService } from '../services';
import { CreateUserDto } from '../model/dto';

@Controller('users')
// @UseGuards(JwtAuthGuard) // Este endpoint no requiere autenticación ya que es para registro
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  async handle(@Body() createUserDto: CreateUserDto) {
    return this.createUserService.execute(createUserDto);
  }
}