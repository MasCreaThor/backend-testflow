// src/modules/study-goals/study-goals.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyGoal, StudyGoalSchema } from './infra/schemas';
import { StudyGoalController } from './controllers';
import { StudyGoalService } from './services';
import { StudyGoalRepository } from './infra/repositories';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudyGoal.name, schema: StudyGoalSchema }]),
  ],
  controllers: [StudyGoalController],
  providers: [StudyGoalService, StudyGoalRepository],
  exports: [StudyGoalService, StudyGoalRepository],
})
export class StudyGoalsModule {}