// src/modules/users/model/interfaces/user.interface.ts
export interface IUser {
  _id: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}