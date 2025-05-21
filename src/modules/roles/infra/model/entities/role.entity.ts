// src/modules/roles/model/entities/role.entity.ts
import { IRole } from '../interfaces/role.interface';

export class Role implements IRole {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(role: IRole) {
    this._id = role._id;
    this.name = role.name;
    this.description = role.description;
    this.permissions = role.permissions || [];
    this.isActive = role.isActive;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}