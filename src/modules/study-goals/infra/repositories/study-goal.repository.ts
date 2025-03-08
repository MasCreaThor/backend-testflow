// src/modules/study-goals/infra/repositories/study-goal.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyGoal, StudyGoalDocument } from '../schemas';
import { IStudyGoal } from '../../model/interfaces';
import { CreateStudyGoalDto } from '../../model/dto';

@Injectable()
export class StudyGoalRepository {
  constructor(
    @InjectModel(StudyGoal.name) private studyGoalModel: Model<StudyGoalDocument>,
  ) {}

  private documentToStudyGoal(doc: StudyGoalDocument): IStudyGoal {
    const goal = doc.toObject();
    return {
      _id: goal._id.toString(),
      name: goal.name,
      description: goal.description,
      category: goal.category,
      isActive: goal.isActive,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async findAll(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    const query = activeOnly ? { isActive: true } : {};
    const goals = await this.studyGoalModel.find(query).exec();
    return goals.map(goal => this.documentToStudyGoal(goal));
  }

  async findById(id: string): Promise<IStudyGoal | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const goal = await this.studyGoalModel.findById(id).exec();
    return goal ? this.documentToStudyGoal(goal) : null;
  }

  async findByIds(ids: string[]): Promise<IStudyGoal[]> {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id))
                       .map(id => new Types.ObjectId(id));
    
    if (validIds.length === 0) {
      return [];
    }
    
    const goals = await this.studyGoalModel
      .find({ _id: { $in: validIds } })
      .exec();
      
    return goals.map(goal => this.documentToStudyGoal(goal));
  }

  async create(goalData: CreateStudyGoalDto): Promise<IStudyGoal> {
    const newGoal = new this.studyGoalModel(goalData);
    const savedGoal = await newGoal.save();
    return this.documentToStudyGoal(savedGoal);
  }

  async update(id: string, goalData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedGoal = await this.studyGoalModel
      .findByIdAndUpdate(id, goalData, { new: true })
      .exec();
      
    return updatedGoal ? this.documentToStudyGoal(updatedGoal) : null;
  }

  async delete(id: string): Promise<IStudyGoal | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const deletedGoal = await this.studyGoalModel.findByIdAndDelete(id).exec();
    return deletedGoal ? this.documentToStudyGoal(deletedGoal) : null;
  }
}