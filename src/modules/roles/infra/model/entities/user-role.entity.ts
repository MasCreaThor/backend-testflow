// src/modules/roles/model/entities/user-role.entity.ts
import { Types } from 'mongoose';
import { IUserRole } from '../interfaces/user-role.interface';

export class UserRole implements IUserRole {
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

  constructor(userRole: IUserRole) {
    this._id = userRole._id;
    
    // Convertir a string si es ObjectId
    this.userId = this.convertToString(userRole.userId);
    this.roleId = this.convertToString(userRole.roleId);
    
    this.expiresAt = userRole.expiresAt;
    this.isActive = userRole.isActive;
    
    if (userRole.grantedBy) {
      this.grantedBy = this.convertToString(userRole.grantedBy);
    }
    
    this.createdAt = userRole.createdAt;
    this.updatedAt = userRole.updatedAt;
    
    // Copiar información del rol si existe
    if (userRole.role) {
      this.role = {
        _id: userRole.role._id,
        name: userRole.role.name,
        permissions: userRole.role.permissions || []
      };
    }
  }

  // Método auxiliar para convertir ObjectId a string
  private convertToString(value: any): string {
    if (value === null || value === undefined) {
      return ""; // Devolver string vacío en lugar de null
    }
    
    // Verificar si es un ObjectId por sus propiedades
    if (value && typeof value === 'object' && value.toString && typeof value.toString === 'function') {
      return value.toString();
    }
    
    // Si ya es string, devolverlo directamente
    if (typeof value === 'string') {
      return value;
    }
    
    // En cualquier otro caso, intentar convertir a string
    return String(value);
  }
}