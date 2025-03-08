// src/modules/people/people.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { People, PeopleSchema } from './infra/schemas';
import { PeopleController } from './controllers/people.controller';
import { StudyGoalsProfileController } from './controllers/study-goals-profile.controller';
import { PeopleService } from './services/people.service';
import { StudyGoalsProfileService } from './services/study-goals-profile.service';
import { PeopleRepository } from './infra/repositories';
import { StudyGoalsModule } from '../study-goals/study-goals.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: People.name, schema: PeopleSchema }]),
    StudyGoalsModule,
  ],
  controllers: [PeopleController, StudyGoalsProfileController],
  providers: [PeopleService, StudyGoalsProfileService, PeopleRepository],
  exports: [PeopleService, PeopleRepository, StudyGoalsProfileService],
})
export class PeopleModule {}