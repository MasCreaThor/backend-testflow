// src/modules/people/model/entities/people.entity.ts
import { Types } from 'mongoose';
import { IPeople } from '../interfaces/people.interface';

export class People implements IPeople {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  studyGoals?: string[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(people: IPeople) {
    this._id = people._id;
    this.userId = people.userId;
    this.firstName = people.firstName;
    this.lastName = people.lastName;
    this.profileImage = people.profileImage;
    // Convertir ObjectId a string si es necesario
    this.studyGoals = Array.isArray(people.studyGoals) 
      ? people.studyGoals.map(goal => goal instanceof Types.ObjectId ? goal.toString() : goal)
      : undefined;
    this.createdAt = people.createdAt;
    this.updatedAt = people.updatedAt;
  }
}