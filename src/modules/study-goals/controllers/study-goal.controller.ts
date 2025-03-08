// src/modules/study-goals/controllers/study-goal.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { StudyGoalService } from '../services';
import { CreateStudyGoalDto } from '../model/dto';

@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class StudyGoalController {
  constructor(private readonly studyGoalService: StudyGoalService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly: boolean = false) {
    return this.studyGoalService.findAll(activeOnly);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.studyGoalService.findById(id);
  }

  @Post()
  async create(@Body() createStudyGoalDto: CreateStudyGoalDto) {
    return this.studyGoalService.create(createStudyGoalDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateStudyGoalDto>
  ) {
    return this.studyGoalService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.studyGoalService.delete(id);
  }
}