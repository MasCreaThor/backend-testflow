// src/modules/roles/infra/repositories/user-role.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole, UserRoleDocument } from '../schemas/user-role.schema';
import { IUserRole } from '../model/interfaces/user-role.interface';
import { AssignRoleDto } from '../model/dto';

@Injectable()
export class UserRoleRepository {
  private readonly logger = new Logger(UserRoleRepository.name);

  constructor(
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRoleDocument>,
  ) {}

  private documentToUserRole(doc: UserRoleDocument): IUserRole {
    const userRole = doc.toObject();
    const result: IUserRole = {
      _id: userRole._id.toString(),
      userId: userRole.userId.toString(),
      roleId: userRole.roleId.toString(),
      isActive: userRole.isActive,
      createdAt: userRole.createdAt,
      updatedAt: userRole.updatedAt,
    };

    if (userRole.expiresAt) {
      result.expiresAt = userRole.expiresAt;
    }

    if (userRole.grantedBy) {
      result.grantedBy = userRole.grantedBy.toString();
    }

    // Manejar datos populados
    if (typeof userRole.roleId === 'object' && userRole.roleId && 'name' in userRole.roleId) {
      result.role = {
        _id: userRole.roleId._id.toString(),
        name: userRole.roleId.name,
        permissions: userRole.roleId.permissions || [],
      };
    }

    return result;
  }

  async findAll(): Promise<IUserRole[]> {
    const userRoles = await this.userRoleModel.find()
      .populate('roleId', 'name permissions')
      .exec();
    return userRoles.map(userRole => this.documentToUserRole(userRole));
  }

  async findById(id: string): Promise<IUserRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const userRole = await this.userRoleModel.findById(id)
      .populate('roleId', 'name permissions')
      .exec();
    return userRole ? this.documentToUserRole(userRole) : null;
  }

  async findByUser(userId: string): Promise<IUserRole[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    const userRoles = await this.userRoleModel.find({ 
      userId: new Types.ObjectId(userId),
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('roleId', 'name permissions')
      .exec();
      
    return userRoles.map(userRole => this.documentToUserRole(userRole));
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<IUserRole | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(roleId)) {
      return null;
    }
    
    const userRole = await this.userRoleModel.findOne({
      userId: new Types.ObjectId(userId),
      roleId: new Types.ObjectId(roleId),
    })
      .populate('roleId', 'name permissions')
      .exec();
      
    return userRole ? this.documentToUserRole(userRole) : null;
  }

  async findByRoleName(userId: string, roleName: string): Promise<IUserRole[]> {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    // Esta función requiere una consulta más compleja con aggregation
    const userRoles = await this.userRoleModel.aggregate([
      {
        $lookup: {
          from: 'roles', // Nombre de la colección (normalmente en plural y minúsculas)
          localField: 'roleId',
          foreignField: '_id',
          as: 'roleData'
        }
      },
      {
        $match: {
          userId: new Types.ObjectId(userId),
          'roleData.name': roleName,
          isActive: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'roleId'
        }
      },
      {
        $unwind: '$roleId'
      }
    ]).exec();
    
    // Transformar los resultados
    return userRoles.map(ur => ({
      _id: ur._id.toString(),
      userId: ur.userId.toString(),
      roleId: ur.roleId._id.toString(),
      role: {
        _id: ur.roleId._id.toString(),
        name: ur.roleId.name,
        permissions: ur.roleId.permissions || []
      },
      isActive: ur.isActive,
      expiresAt: ur.expiresAt,
      grantedBy: ur.grantedBy ? ur.grantedBy.toString() : undefined,
      createdAt: ur.createdAt,
      updatedAt: ur.updatedAt
    }));
  }

  async assign(assignRoleDto: AssignRoleDto): Promise<IUserRole> {
    try {
      // Convertir IDs a ObjectId
      const data: any = {
        ...assignRoleDto,
        userId: new Types.ObjectId(assignRoleDto.userId),
        roleId: new Types.ObjectId(assignRoleDto.roleId),
      };
      
      if (assignRoleDto.grantedBy) {
        data.grantedBy = new Types.ObjectId(assignRoleDto.grantedBy);
      }
      
      // Intentar encontrar si ya existe una asignación
      const existingAssignment = await this.userRoleModel.findOne({
        userId: data.userId,
        roleId: data.roleId,
      });
      
      if (existingAssignment) {
        // Actualizar la asignación existente
        existingAssignment.isActive = true;
        existingAssignment.expiresAt = data.expiresAt;
        if (data.grantedBy) {
          existingAssignment.grantedBy = data.grantedBy;
        }
        
        const updatedAssignment = await existingAssignment.save();
        return this.documentToUserRole(updatedAssignment);
      } else {
        // Crear nueva asignación
        const newUserRole = new this.userRoleModel(data);
        const savedUserRole = await newUserRole.save();
        return this.documentToUserRole(savedUserRole);
      }
    } catch (error) {
      this.logger.error(`Error assigning role: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removeRole(userId: string, roleId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(roleId)) {
      return false;
    }
    
    try {
      const result = await this.userRoleModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          roleId: new Types.ObjectId(roleId),
        },
        { isActive: false },
        { new: true }
      );
      
      return !!result;
    } catch (error) {
      this.logger.error(`Error removing role: ${error.message}`, error.stack);
      return false;
    }
  }

  async delete(id: string): Promise<IUserRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    
    try {
      const deletedUserRole = await this.userRoleModel.findByIdAndDelete(id).exec();
      return deletedUserRole ? this.documentToUserRole(deletedUserRole) : null;
    } catch (error) {
      this.logger.error(`Error deleting user role: ${error.message}`, error.stack);
      return null;
    }
  }
}