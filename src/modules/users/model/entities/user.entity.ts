// src/modules/users/model/entities/user.entity.ts
import { IUser } from '../interfaces/user.interface';

export class User implements IUser {
  _id: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;

  constructor(user: IUser) {
    this._id = user._id;
    this.email = user.email;
    this.password = user.password;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.lastLogin = user.lastLogin;
  }
}