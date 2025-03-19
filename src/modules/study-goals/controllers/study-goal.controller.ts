// src/modules/study-goals/controllers/study-goal.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { StudyGoalService } from '../services';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';

@Controller('study-goals')
@UseGuards(JwtAuthGuard)
export class StudyGoalController {
  constructor(private readonly studyGoalService: StudyGoalService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly: boolean = false): Promise<IStudyGoal[]> {
    return this.studyGoalService.findAll(activeOnly);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string): Promise<IStudyGoal[]> {
    return this.studyGoalService.findByCategory(categoryId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<IStudyGoal> {
    return this.studyGoalService.findById(id);
  }

  @Post()
  async create(@Body() createStudyGoalDto: CreateStudyGoalDto): Promise<IStudyGoal> {
    return this.studyGoalService.create(createStudyGoalDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateStudyGoalDto>
  ): Promise<IStudyGoal> {
    return this.studyGoalService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.studyGoalService.delete(id);
    return { message: 'Objetivo de estudio eliminado con éxito' };
  }
}