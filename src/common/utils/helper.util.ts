// src/common/utils/helper.util.ts
export class Helper {
    /**
     * Elimina información sensible de un objeto de usuario
     */
    static sanitizeUser(user: any): any {
      if (!user) return null;
      
      const sanitized = { ...user };
      delete sanitized.password;
      return sanitized;
    }
  
    /**
     * Genera un código aleatorio de longitud específica
     */
    static generateRandomCode(length: number = 6): string {
      const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }
  
    /**
     * Valida si un string es un ObjectId válido de MongoDB
     */
    static isValidObjectId(id: string): boolean {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      return objectIdPattern.test(id);
    }
  
    /**
     * Formatea una fecha a formato local
     */
    static formatDate(date: Date): string {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  }