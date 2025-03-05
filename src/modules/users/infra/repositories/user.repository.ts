// src/modules/users/infra/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas';
import { IUser } from '../../model/interfaces';
import { CreateUserDto, UpdateUserDto } from '../../model/dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Función auxiliar para convertir Documentos de Mongoose a IUser
  private documentToUser(doc: UserDocument): IUser {
    const user = doc.toObject();
    return {
      _id: user._id.toString(), // Convertir ObjectId a string
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    };
  }

  async findAll(): Promise<IUser[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => this.documentToUser(user));
  }

  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const user = await this.userModel.findById(id).exec();
    return user ? this.documentToUser(user) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.documentToUser(user) : null;
  }

  async create(userData: CreateUserDto): Promise<IUser> {
    const newUser = new this.userModel(userData);
    const savedUser = await newUser.save();
    return this.documentToUser(savedUser);
  }

  async update(id: string, userData: UpdateUserDto): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();
      
    return updatedUser ? this.documentToUser(updatedUser) : null;
  }

  async updateLastLogin(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true })
      .exec();
      
    return updatedUser ? this.documentToUser(updatedUser) : null;
  }

  async delete(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    return deletedUser ? this.documentToUser(deletedUser) : null;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.userModel.findOne().exec();
      return true;
    } catch (error) {
      return false;
    }
  }
}