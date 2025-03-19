// src/modules/study-goals/services/study-goal.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StudyGoalRepository } from '../infra/repositories';
import { CategoryRepository } from '../../categories/infra/repositories/category.repository';
import { CreateStudyGoalDto } from '../model/dto';
import { IStudyGoal } from '../model/interfaces';

@Injectable()
export class StudyGoalService {
  constructor(
    private readonly studyGoalRepository: StudyGoalRepository,
    private readonly categoryRepository: CategoryRepository,
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

  async findByCategory(categoryId: string): Promise<IStudyGoal[]> {

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada`);
    }

    return this.studyGoalRepository.findByCategory(categoryId);
  }

  async create(createStudyGoalDto: CreateStudyGoalDto): Promise<IStudyGoal> {

    if (createStudyGoalDto.categoryId) {
      const category = await this.categoryRepository.findById(createStudyGoalDto.categoryId);
      if (!category) {
        throw new BadRequestException(`La categoría con ID ${createStudyGoalDto.categoryId} no existe`);
      }
    }
    
    return this.studyGoalRepository.create(createStudyGoalDto);
  }

  async update(id: string, updateData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal> {

    if (updateData.categoryId) {
      const category = await this.categoryRepository.findById(updateData.categoryId);
      if (!category) {
        throw new BadRequestException(`La categoría con ID ${updateData.categoryId} no existe`);
      }
    }
    
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