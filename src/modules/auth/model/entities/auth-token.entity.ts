// src/modules/auth/model/entities/auth-token.entity.ts
import { IToken } from '../interfaces';

export class AuthToken implements IToken {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  type: string;
  createdAt?: Date;

  constructor(token: IToken) {
    this._id = token._id;
    this.userId = token.userId;
    this.token = token.token;
    this.expiresAt = token.expiresAt;
    this.used = token.used;
    this.type = token.type;
    this.createdAt = token.createdAt;
  }
}