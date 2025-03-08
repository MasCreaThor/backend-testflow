// src/modules/people/controllers/people.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { PeopleService } from '../services';
import { CreatePeopleDto, UpdatePeopleDto } from '../model/dto';

@Controller('people')
@UseGuards(JwtAuthGuard)
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async findAll() {
    return this.peopleService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.peopleService.findById(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.peopleService.findByUserId(userId);
  }

  @Post()
  async create(@Body() createPeopleDto: CreatePeopleDto) {
    return this.peopleService.create(createPeopleDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePeopleDto: UpdatePeopleDto) {
    return this.peopleService.update(id, updatePeopleDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.peopleService.delete(id);
  }
}