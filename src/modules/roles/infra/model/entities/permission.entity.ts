// src/modules/roles/model/entities/permission.entity.ts
import { IPermission } from '../interfaces/permission.interface';

export class Permission implements IPermission {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  group?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(permission: IPermission) {
    this._id = permission._id;
    this.name = permission.name;
    this.description = permission.description;
    this.isActive = permission.isActive;
    this.group = permission.group;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}