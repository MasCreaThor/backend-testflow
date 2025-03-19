// src/modules/roles/infra/repositories/role.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { IRole } from '../model/interfaces/role.interface';
import { CreateRoleDto, UpdateRoleDto } from '../model/dto';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  private documentToRole(doc: RoleDocument): IRole {
    const role = doc.toObject();
    return {
      _id: role._id.toString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async findAll(activeOnly: boolean = false): Promise<IRole[]> {
    const query = activeOnly ? { isActive: true } : {};
    const roles = await this.roleModel.find(query).exec();
    return roles.map(role => this.documentToRole(role));
  }

  async findById(id: string): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const role = await this.roleModel.findById(id).exec();
    return role ? this.documentToRole(role) : null;
  }

  async findByName(name: string): Promise<IRole | null> {
    const role = await this.roleModel.findOne({ name }).exec();
    return role ? this.documentToRole(role) : null;
  }

  async create(roleData: CreateRoleDto): Promise<IRole> {
    const newRole = new this.roleModel(roleData);
    const savedRole = await newRole.save();
    return this.documentToRole(savedRole);
  }

  async update(id: string, roleData: UpdateRoleDto): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, roleData, { new: true })
      .exec();
      
    return updatedRole ? this.documentToRole(updatedRole) : null;
  }

  async delete(id: string): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();
    return deletedRole ? this.documentToRole(deletedRole) : null;
  }

  async addPermission(id: string, permission: string): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      return null;
    }
    
    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      await role.save();
    }
    
    return this.documentToRole(role);
  }

  async removePermission(id: string, permission: string): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      return null;
    }
    
    role.permissions = role.permissions.filter(p => p !== permission);
    await role.save();
    
    return this.documentToRole(role);
  }
}