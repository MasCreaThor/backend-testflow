// src/modules/users/controllers/test-connection.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { TestConnectionService } from '../services';

@Controller('users/test-connection')
export class TestConnectionController {
  constructor(private readonly testConnectionService: TestConnectionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async handle() {
    return this.testConnectionService.execute();
  }
}