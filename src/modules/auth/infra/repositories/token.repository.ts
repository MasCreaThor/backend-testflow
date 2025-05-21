// src/modules/auth/infra/repositories/token.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthToken, AuthTokenDocument } from '../schemas';
import { IToken } from '../../model/interfaces';
import { LoggerService } from '../../../../shared/services/logger.service';

/**
 * Repositorio para operaciones de base de datos relacionadas con tokens
 */
@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(AuthToken.name) private tokenModel: Model<AuthTokenDocument>,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(TokenRepository.name);
  }

  /**
   * Convierte un documento de token de MongoDB a una interfaz de token
   * @param doc Documento de token de MongoDB
   * @returns Interfaz de token
   */
  private documentToToken(doc: AuthTokenDocument): IToken {
    try {
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
    } catch (error) {
      this.logger.error(`Error al convertir documento a token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crea un nuevo token
   * @param tokenData Datos del token a crear
   * @returns Token creado
   */
  async create(tokenData: Partial<IToken>): Promise<IToken> {
    try {
      this.logger.debug(`Creando nuevo token para usuario: ${tokenData.userId}`);
      
      const newToken = new this.tokenModel({
        ...tokenData,
        userId: new Types.ObjectId(tokenData.userId),
      });
      
      const savedToken = await newToken.save();
      this.logger.debug(`Token creado exitosamente: ${savedToken._id}`);
      
      return this.documentToToken(savedToken);
    } catch (error) {
      this.logger.error(`Error al crear token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un token por su valor
   * @param token Valor del token a buscar
   * @returns Token encontrado o null
   */
  async findByToken(token: string): Promise<IToken | null> {
    try {
      this.logger.debug(`Buscando token: ${token.substring(0, 10)}...`);
      
      const foundToken = await this.tokenModel.findOne({ token }).exec();
      
      if (foundToken) {
        this.logger.debug(`Token encontrado: ${foundToken._id}`);
      } else {
        this.logger.debug(`Token no encontrado`);
      }
      
      return foundToken ? this.documentToToken(foundToken) : null;
    } catch (error) {
      this.logger.error(`Error al buscar token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un token válido (no usado y no expirado) por usuario y tipo
   * @param userId ID del usuario
   * @param type Tipo de token (refresh, reset, etc.)
   * @returns Token encontrado o null
   */
  async findValidTokenByUser(userId: string, type: string): Promise<IToken | null> {
    try {
      this.logger.debug(`Buscando token válido para usuario: ${userId}, tipo: ${type}`);
      
      const foundToken = await this.tokenModel.findOne({
        userId: new Types.ObjectId(userId),
        type,
        used: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 }).exec();
      
      if (foundToken) {
        this.logger.debug(`Token válido encontrado: ${foundToken._id}`);
      } else {
        this.logger.debug(`No se encontró token válido`);
      }
      
      return foundToken ? this.documentToToken(foundToken) : null;
    } catch (error) {
      this.logger.error(`Error al buscar token válido: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Marca un token como usado
   * @param tokenId ID del token
   * @returns Token actualizado o null
   */
  async markAsUsed(tokenId: string): Promise<IToken | null> {
    try {
      if (!Types.ObjectId.isValid(tokenId)) {
        this.logger.warn(`ID de token inválido: ${tokenId}`);
        return null;
      }
      
      this.logger.debug(`Marcando token como usado: ${tokenId}`);
      
      const updatedToken = await this.tokenModel
        .findByIdAndUpdate(tokenId, { used: true }, { new: true })
        .exec();
        
      if (updatedToken) {
        this.logger.debug(`Token marcado como usado exitosamente: ${tokenId}`);
      } else {
        this.logger.warn(`No se encontró token con ID: ${tokenId}`);
      }
      
      return updatedToken ? this.documentToToken(updatedToken) : null;
    } catch (error) {
      this.logger.error(`Error al marcar token como usado: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Elimina todos los tokens de un usuario de un tipo específico
   * @param userId ID del usuario
   * @param type Tipo de token (refresh, reset, etc.)
   */
  async deleteUserTokens(userId: string, type: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        this.logger.warn(`ID de usuario inválido: ${userId}`);
        return;
      }
      
      this.logger.debug(`Eliminando tokens de tipo ${type} para usuario: ${userId}`);
      
      const result = await this.tokenModel
        .deleteMany({
          userId: new Types.ObjectId(userId),
          type,
        })
        .exec();
        
      this.logger.debug(`${result.deletedCount} tokens eliminados`);
    } catch (error) {
      this.logger.error(`Error al eliminar tokens de usuario: ${error.message}`, error.stack);
      throw error;
    }
  }
}