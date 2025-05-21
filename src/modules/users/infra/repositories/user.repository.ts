// src/modules/users/infra/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas';
import { IUser } from '../../model/interfaces';
import { CreateUserDto, UpdateUserDto } from '../../model/dto';
import { LoggerService } from '../../../../shared/services/logger.service';

/**
 * Repositorio para operaciones de base de datos relacionadas con usuarios
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UserRepository.name);
  }

  /**
   * Convierte un documento de MongoDB a una interfaz de usuario
   * @param doc Documento de usuario de MongoDB
   * @returns Interfaz de usuario
   */
  private documentToUser(doc: UserDocument): IUser {
    try {
      const user = doc.toObject();
      return {
        _id: user._id.toString(),
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      this.logger.error(`Error al convertir documento a usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios
   */
  async findAll(): Promise<IUser[]> {
    try {
      const users = await this.userModel.find().exec();
      return users.map(user => this.documentToUser(user));
    } catch (error) {
      this.logger.error(`Error al buscar todos los usuarios: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario encontrado o null
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido: ${id}`);
        return null;
      }
      
      const user = await this.userModel.findById(id).exec();
      return user ? this.documentToUser(user) : null;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un usuario por su email
   * @param email Email del usuario
   * @returns Usuario encontrado o null
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      return user ? this.documentToUser(user) : null;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param userData Datos del usuario a crear
   * @returns Usuario creado
   */
  async create(userData: CreateUserDto): Promise<IUser> {
    try {
      const newUser = new this.userModel(userData);
      const savedUser = await newUser.save();
      return this.documentToUser(savedUser);
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param userData Datos a actualizar
   * @returns Usuario actualizado o null
   */
  async update(id: string, userData: UpdateUserDto): Promise<IUser | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para actualizar: ${id}`);
        return null;
      }
      
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, userData, { new: true })
        .exec();
        
      return updatedUser ? this.documentToUser(updatedUser) : null;
    } catch (error) {
      this.logger.error(`Error al actualizar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualiza la fecha de último login de un usuario
   * @param id ID del usuario
   * @returns Usuario actualizado o null
   */
  async updateLastLogin(id: string): Promise<IUser | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para actualizar último login: ${id}`);
        return null;
      }
      
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true })
        .exec();
        
      return updatedUser ? this.documentToUser(updatedUser) : null;
    } catch (error) {
      this.logger.error(`Error al actualizar último login: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   * @returns Usuario eliminado o null
   */
  async delete(id: string): Promise<IUser | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`ID inválido para eliminar: ${id}`);
        return null;
      }
      
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      return deletedUser ? this.documentToUser(deletedUser) : null;
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Prueba la conexión a la base de datos
   * @returns true si la conexión es exitosa, false en caso contrario
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.userModel.findOne().exec();
      return true;
    } catch (error) {
      this.logger.error(`Error al probar conexión: ${error.message}`, error.stack);
      return false;
    }
  }
}