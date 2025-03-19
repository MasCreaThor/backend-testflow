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
    const result: IStudyGoal = {
      _id: goal._id.toString(),
      name: goal.name,
      description: goal.description,
      isActive: goal.isActive,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };

    // Manejar categoryId si existe
    if (goal.categoryId) {
      result.categoryId = goal.categoryId.toString();
    }

    // Manejar datos populados de categoría
    if (goal.categoryId && typeof goal.categoryId === 'object' && 'name' in goal.categoryId) {
      result.category = {
        _id: goal.categoryId._id.toString(),
        name: goal.categoryId.name,
      };
    }

    return result;
  }

  async findAll(activeOnly: boolean = false): Promise<IStudyGoal[]> {
    const query = activeOnly ? { isActive: true } : {};
    const goals = await this.studyGoalModel.find(query)
      .populate('categoryId', 'name')
      .exec();
    return goals.map(goal => this.documentToStudyGoal(goal));
  }

  async findById(id: string): Promise<IStudyGoal | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const goal = await this.studyGoalModel.findById(id)
      .populate('categoryId', 'name')
      .exec();
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
      .populate('categoryId', 'name')
      .exec();
      
    return goals.map(goal => this.documentToStudyGoal(goal));
  }

  async findByCategory(categoryId: string): Promise<IStudyGoal[]> {
    if (!Types.ObjectId.isValid(categoryId)) {
      return [];
    }

    const goals = await this.studyGoalModel
      .find({ categoryId: new Types.ObjectId(categoryId) })
      .populate('categoryId', 'name')
      .exec();

    return goals.map(goal => this.documentToStudyGoal(goal));
  }

  async create(goalData: CreateStudyGoalDto): Promise<IStudyGoal> {
    const data: any = { ...goalData };
    
    if (goalData.categoryId && Types.ObjectId.isValid(goalData.categoryId)) {
      data.categoryId = new Types.ObjectId(goalData.categoryId);
    }
    
    const newGoal = new this.studyGoalModel(data);
    const savedGoal = await newGoal.save();
    
    await savedGoal.populate('categoryId', 'name');
    
    return this.documentToStudyGoal(savedGoal);
  }

  async update(id: string, goalData: Partial<CreateStudyGoalDto>): Promise<IStudyGoal | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const data: any = { ...goalData };
    
    if (goalData.categoryId && Types.ObjectId.isValid(goalData.categoryId)) {
      data.categoryId = new Types.ObjectId(goalData.categoryId);
    }
    
    const updatedGoal = await this.studyGoalModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('categoryId', 'name')
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