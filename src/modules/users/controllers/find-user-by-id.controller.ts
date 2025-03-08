// src/modules/users/controllers/find-user-by-id.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { FindUserByIdService } from '../services';

@Controller('users')
export class FindUserByIdController {
  constructor(private readonly findUserByIdService: FindUserByIdService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async handle(@Param('id') id: string) {
    return this.findUserByIdService.execute(id);
  }
}
