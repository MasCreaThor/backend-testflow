// src/modules/users/model/interfaces/user.interface.ts
export interface IUser {
  _id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}
