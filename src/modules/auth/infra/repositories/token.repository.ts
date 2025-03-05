// src/modules/auth/infra/repositories/token.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthToken, AuthTokenDocument } from '../schemas';
import { IToken } from '../../model/interfaces';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(AuthToken.name) private tokenModel: Model<AuthTokenDocument>,
  ) {}

  private documentToToken(doc: AuthTokenDocument): IToken {
    const token = doc.toObject();
    return {
      _id: token._id.toString(),
      userId: token.userId.toString(),
      token: token.token,
      expiresAt: token.expiresAt,
      used: token.used,
      type: token.type,
      createdAt: token.createdAt,
    };
  }

  async create(tokenData: Partial<IToken>): Promise<IToken> {
    const newToken = new this.tokenModel({
      ...tokenData,
      userId: new Types.ObjectId(tokenData.userId),
    });
    const savedToken = await newToken.save();
    return this.documentToToken(savedToken);
  }

  async findByToken(token: string): Promise<IToken | null> {
    const foundToken = await this.tokenModel.findOne({ token }).exec();
    return foundToken ? this.documentToToken(foundToken) : null;
  }

  async findValidTokenByUser(userId: string, type: string): Promise<IToken | null> {
    const foundToken = await this.tokenModel.findOne({
      userId: new Types.ObjectId(userId),
      type,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).exec();
    
    return foundToken ? this.documentToToken(foundToken) : null;
  }

  async markAsUsed(tokenId: string): Promise<IToken | null> {
    if (!Types.ObjectId.isValid(tokenId)) {
      return null;
    }
    
    const updatedToken = await this.tokenModel
      .findByIdAndUpdate(tokenId, { used: true }, { new: true })
      .exec();
      
    return updatedToken ? this.documentToToken(updatedToken) : null;
  }

  async deleteUserTokens(userId: string, type: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      return;
    }
    
    await this.tokenModel
      .deleteMany({
        userId: new Types.ObjectId(userId),
        type,
      })
      .exec();
  }
}