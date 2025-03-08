// src/modules/study-goals/services/study-goal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';

@Injectable()
export class StudyGoalService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    return this.studyGoalRepository.findAll(activeOnly);
  }

  async findById(id: string): Promise<IStudyGoal> {
    const goal = await this.studyGoalRepository.findById(id);
    if (!goal) {
      throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
    }
    return goal;
  }

  async create(createStudyGoalDto: CreateStudyGoalDto): Promise<IStudyGoal> {
    return this.studyGoalRepository.create(createStudyGoalDto);
  }

  async update(id: string, updateData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal> {
    const updatedGoal = await this.studyGoalRepository.update(id, updateData);
    if (!updatedGoal) {
      throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
    }
    return updatedGoal;
  }

  async delete(id: string): Promise<void> {
    const deletedGoal = await this.studyGoalRepository.delete(id);
    if (!deletedGoal) {
      throw new NotFoundException(`Objetivo de estudio con ID ${id} no encontrado`);
    }
  }
}