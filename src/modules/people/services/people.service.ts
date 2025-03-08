// src/modules/people/services/people.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { CreatePeopleDto, UpdatePeopleDto } from '../model/dto';
import { IPeople } from '../model/interfaces';

@Injectable()
export class PeopleService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
  ) {}

  async findAll(): Promise<IPeople[]> {
    return this.peopleRepository.findAll();
  }

  async findById(id: string): Promise<IPeople> {
    const person = await this.peopleRepository.findById(id);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return person;
  }

  async findByUserId(userId: string): Promise<IPeople> {
    const person = await this.peopleRepository.findByUserId(userId);
    if (!person) {
      throw new NotFoundException(`Persona con ID de usuario ${userId} no encontrada`);
    }
    return person;
  }

  async create(createPeopleDto: CreatePeopleDto): Promise<IPeople> {
    // Validar objetivos de estudio si se proporcionan
    if (createPeopleDto.studyGoals && createPeopleDto.studyGoals.length > 0) {
      const validGoals = await this.studyGoalRepository.findByIds(createPeopleDto.studyGoals);
      
      if (validGoals.length !== createPeopleDto.studyGoals.length) {
        throw new BadRequestException('Algunos objetivos de estudio no son válidos');
      }
    }
    
    return this.peopleRepository.create(createPeopleDto);
  }

  async update(id: string, updatePeopleDto: UpdatePeopleDto): Promise<IPeople> {
    // Validar objetivos de estudio si se proporcionan
    if (updatePeopleDto.studyGoals && updatePeopleDto.studyGoals.length > 0) {
      const validGoals = await this.studyGoalRepository.findByIds(updatePeopleDto.studyGoals);
      
      if (validGoals.length !== updatePeopleDto.studyGoals.length) {
        throw new BadRequestException('Algunos objetivos de estudio no son válidos');
      }
    }
    
    const updatedPerson = await this.peopleRepository.update(id, updatePeopleDto);
    if (!updatedPerson) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    
    return updatedPerson;
  }

  async delete(id: string): Promise<void> {
    const deletedPerson = await this.peopleRepository.delete(id);
    if (!deletedPerson) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
  }
}