// src/modules/people/services/study-goals-profile.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PeopleRepository } from '../infra/repositories';
import { StudyGoalRepository } from '../../study-goals/infra/repositories';
import { IPeople } from '../model/interfaces';

@Injectable()
export class StudyGoalsProfileService {
  constructor(
    private readonly peopleRepository: PeopleRepository,
    private readonly studyGoalRepository: StudyGoalRepository,
  ) {}

  async addStudyGoal(peopleId: string, goalId: string): Promise<IPeople> {
    // Verificar si existe la persona
    const person = await this.peopleRepository.findById(peopleId);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${peopleId} no encontrada`);
    }
    
    // Verificar si existe el objetivo
    const goal = await this.studyGoalRepository.findById(goalId);
    if (!goal) {
      throw new NotFoundException(`Objetivo de estudio con ID ${goalId} no encontrado`);
    }
    
    // Verificar si ya tiene este objetivo
    const currentGoals = person.studyGoals || [];
    if (currentGoals.some(id => typeof id === 'string' ? id === goalId : id.toString() === goalId)) {
      throw new BadRequestException('Este objetivo de estudio ya está asociado al perfil');
    }
    
    // Añadir el objetivo a la persona (como string)
    const updatedGoals = [...currentGoals.map(id => typeof id === 'string' ? id : id.toString()), goalId];
    
    // Actualizar el perfil
    const updatedPerson = await this.peopleRepository.update(peopleId, {
      studyGoals: updatedGoals
    });
    
    if (!updatedPerson) {
      throw new BadRequestException('No se pudo actualizar el perfil');
    }
    
    return updatedPerson;
  }

  async removeStudyGoal(peopleId: string, goalId: string): Promise<IPeople> {
    // Verificar si existe la persona
    const person = await this.peopleRepository.findById(peopleId);
    if (!person) {
      throw new NotFoundException(`Persona con ID ${peopleId} no encontrada`);
    }
    
    // Verificar si tiene este objetivo
    const currentGoals = person.studyGoals || [];
    if (!currentGoals.some(id => typeof id === 'string' ? id === goalId : id.toString() === goalId)) {
      throw new BadRequestException('Este objetivo de estudio no está asociado al perfil');
    }
    
    // Quitar el objetivo de la persona
    const updatedGoals = currentGoals
      .filter(id => typeof id === 'string' ? id !== goalId : id.toString() !== goalId)
      .map(id => typeof id === 'string' ? id : id.toString());
    
    // Actualizar el perfil
    const updatedPerson = await this.peopleRepository.update(peopleId, {
      studyGoals: updatedGoals
    });
    
    if (!updatedPerson) {
      throw new BadRequestException('No se pudo actualizar el perfil');
    }
    
    return updatedPerson;
  }
}