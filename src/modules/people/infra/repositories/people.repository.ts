// src/modules/people/infra/repositories/people.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { People, PeopleDocument } from '../schemas';
import { IPeople } from '../../model/interfaces';
import { CreatePeopleDto, UpdatePeopleDto } from '../../model/dto';

@Injectable()
export class PeopleRepository {
  constructor(
    @InjectModel(People.name) private peopleModel: Model<PeopleDocument>,
  ) {}

  private documentToPeople(doc: PeopleDocument): IPeople {
    const people = doc.toObject();
    return {
      _id: people._id.toString(),
      userId: people.userId.toString(),
      firstName: people.firstName,
      lastName: people.lastName,
      profileImage: people.profileImage,
      studyGoals: people.studyGoals?.map(goal => goal.toString()),
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
    };
  }

  async findAll(): Promise<IPeople[]> {
    const peopleList = await this.peopleModel.find().exec();
    return peopleList.map(person => this.documentToPeople(person));
  }

  async findById(id: string): Promise<IPeople | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const person = await this.peopleModel.findById(id).exec();
    return person ? this.documentToPeople(person) : null;
  }

  async findByUserId(userId: string): Promise<IPeople | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    
    const person = await this.peopleModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    return person ? this.documentToPeople(person) : null;
  }

  async create(peopleData: CreatePeopleDto): Promise<IPeople> {
    const newPerson = new this.peopleModel({
      ...peopleData,
      userId: new Types.ObjectId(peopleData.userId),
      studyGoals: peopleData.studyGoals?.map(goalId => new Types.ObjectId(goalId)) || [],
    });
    
    const savedPerson = await newPerson.save();
    return this.documentToPeople(savedPerson);
  }

  async update(id: string, peopleData: UpdatePeopleDto): Promise<IPeople | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updateData: any = { ...peopleData };
    
    // Convertir IDs de objetivos a ObjectId si existen
    if (peopleData.studyGoals) {
      updateData.studyGoals = peopleData.studyGoals.map(
        goalId => new Types.ObjectId(goalId)
      );
    }
    
    const updatedPerson = await this.peopleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
      
    return updatedPerson ? this.documentToPeople(updatedPerson) : null;
  }

  async delete(id: string): Promise<IPeople | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const deletedPerson = await this.peopleModel.findByIdAndDelete(id).exec();
    return deletedPerson ? this.documentToPeople(deletedPerson) : null;
  }
}