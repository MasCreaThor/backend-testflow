// src/modules/people/controllers/study-goals-profile.controller.ts
import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards';
import { StudyGoalsProfileService } from '../services';

@Controller('people/:peopleId/study-goals')
@UseGuards(JwtAuthGuard)
export class StudyGoalsProfileController {
  constructor(private readonly studyGoalsProfileService: StudyGoalsProfileService) {}

  @Post(':goalId')
  async addStudyGoal(
    @Param('peopleId') peopleId: string,
    @Param('goalId') goalId: string
  ) {
    return this.studyGoalsProfileService.addStudyGoal(peopleId, goalId);
  }

  @Delete(':goalId')
  async removeStudyGoal(
    @Param('peopleId') peopleId: string,
    @Param('goalId') goalId: string
  ) {
    return this.studyGoalsProfileService.removeStudyGoal(peopleId, goalId);
  }
}