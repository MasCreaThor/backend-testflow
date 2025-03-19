// src/modules/roles/infra/repositories/permission.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { IPermission } from '../model/interfaces/permission.interface';
import { CreatePermissionDto, UpdatePermissionDto } from '../model/dto';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  private documentToPermission(doc: PermissionDocument): IPermission {
    const permission = doc.toObject();
    return {
      _id: permission._id.toString(),
      name: permission.name,
      description: permission.description,
      isActive: permission.isActive,
      group: permission.group,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }

  async findAll(activeOnly: boolean = false): Promise<IPermission[]> {
    const query = activeOnly ? { isActive: true } : {};
    const permissions = await this.permissionModel.find(query).exec();
    return permissions.map(permission => this.documentToPermission(permission));
  }

  async findById(id: string): Promise<IPermission | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const permission = await this.permissionModel.findById(id).exec();
    return permission ? this.documentToPermission(permission) : null;
  }

  async findByName(name: string): Promise<IPermission | null> {
    const permission = await this.permissionModel.findOne({ name }).exec();
    return permission ? this.documentToPermission(permission) : null;
  }

  async findByNames(names: string[]): Promise<IPermission[]> {
    const permissions = await this.permissionModel.find({ name: { $in: names } }).exec();
    return permissions.map(permission => this.documentToPermission(permission));
  }

  async findByGroup(group: string): Promise<IPermission[]> {
    const permissions = await this.permissionModel.find({ group }).exec();
    return permissions.map(permission => this.documentToPermission(permission));
  }

  async create(permissionData: CreatePermissionDto): Promise<IPermission> {
    const newPermission = new this.permissionModel(permissionData);
    const savedPermission = await newPermission.save();
    return this.documentToPermission(savedPermission);
  }

  async update(id: string, permissionData: UpdatePermissionDto): Promise<IPermission | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updatedPermission = await this.permissionModel
      .findByIdAndUpdate(id, permissionData, { new: true })
      .exec();
      
    return updatedPermission ? this.documentToPermission(updatedPermission) : null;
  }

  async delete(id: string): Promise<IPermission | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const deletedPermission = await this.permissionModel.findByIdAndDelete(id).exec();
    return deletedPermission ? this.documentToPermission(deletedPermission) : null;
  }
}