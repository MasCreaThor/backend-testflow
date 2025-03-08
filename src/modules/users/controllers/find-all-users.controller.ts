// src/modules/users/controllers/find-all-users.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { FindAllUsersService } from '../services';

@Controller('users')
export class FindAllUsersController {
  constructor(private readonly findAllUsersService: FindAllUsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async handle() {
    return this.findAllUsersService.execute();
  }
}
