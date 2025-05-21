// src/modules/auth/model/interfaces/token.interface.ts
export interface IToken {
    _id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    type: string;
    createdAt?: Date;
  }