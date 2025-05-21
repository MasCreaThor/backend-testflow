// src/modules/roles/model/interfaces/user-role.interface.ts
export interface IUserRole {
    _id: string;
    userId: string;
    roleId: string;
    expiresAt?: Date;
    isActive?: boolean;
    grantedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    

    role?: {
      _id: string;
      name: string;
      permissions: string[];
    };
  }