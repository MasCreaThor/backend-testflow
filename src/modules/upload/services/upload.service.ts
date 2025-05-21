// src/modules/upload/services/upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsDir: string;
  private readonly profileImagesDir: string;
  private readonly documentsDir: string;

  constructor(private readonly configService: ConfigService) {
    // Obtener la ruta base de la aplicación
    const appUrl = this.configService.get<string>('app.url') || 'http://localhost:3001';
    
    // Configurar directorios de uploads
    this.uploadsDir = join(process.cwd(), 'uploads');
    this.profileImagesDir = join(this.uploadsDir, 'profile-images');
    this.documentsDir = join(this.uploadsDir, 'documents');
    
    // Crear directorios si no existen
    this.createDirectories();
  }

  private createDirectories(): void {
    try {
      // Verificar y crear directorio principal de uploads
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        this.logger.log(`Directorio creado: ${this.uploadsDir}`);
      }
      
      // Verificar y crear directorio para imágenes de perfil
      if (!fs.existsSync(this.profileImagesDir)) {
        fs.mkdirSync(this.profileImagesDir, { recursive: true });
        this.logger.log(`Directorio creado: ${this.profileImagesDir}`);
      }
      
      // Verificar y crear directorio para documentos
      if (!fs.existsSync(this.documentsDir)) {
        fs.mkdirSync(this.documentsDir, { recursive: true });
        this.logger.log(`Directorio creado: ${this.documentsDir}`);
      }
    } catch (error) {
      this.logger.error(`Error al crear directorios: ${error.message}`, error.stack);
      throw new Error('No se pudieron crear los directorios necesarios para uploads');
    }
  }

  /**
   * Elimina un archivo si existe
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Archivo eliminado: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Obtiene la ruta del directorio para imágenes de perfil
   */
  getProfileImagesPath(): string {
    return this.profileImagesDir;
  }

  /**
   * Obtiene la ruta del directorio para documentos
   */
  getDocumentsPath(): string {
    return this.documentsDir;
  }

  /**
   * Genera una URL para acceder al archivo subido
   */
  getFileUrl(filePath: string): string {
    const baseUrl = this.configService.get<string>('app.url') || 'http://localhost:3001';
    // Extraer la parte relativa a uploads
    const relativePath = filePath.substring(filePath.indexOf('uploads'));
    return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Valida que un archivo exista
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}