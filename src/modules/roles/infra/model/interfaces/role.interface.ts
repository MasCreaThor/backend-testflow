// src/modules/roles/model/interfaces/role.interface.ts
export interface IRole {
    _id: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }