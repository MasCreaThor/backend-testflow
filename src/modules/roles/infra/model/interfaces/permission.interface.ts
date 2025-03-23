// src/modules/roles/model/interfaces/permission.interface.ts
export interface IPermission {
    _id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    group?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }