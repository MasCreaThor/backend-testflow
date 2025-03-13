// src/modules/upload/controllers/profile-upload.controller.ts
import {
    Controller,
    Post,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Param,
    Delete,
    NotFoundException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { JwtAuthGuard } from '../../../common/guards';
  import { UploadService } from '../services/upload.service';
  import { PeopleService } from '../../people/services/people.service';
  import { join } from 'path';
  
  // Definición de la interfaz File para resolver el error de tipado
  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
  
  @Controller('uploads')
  @UseGuards(JwtAuthGuard)
  export class ProfileUploadController {
    constructor(
      private readonly uploadService: UploadService,
      private readonly peopleService: PeopleService,
    ) {}
  
    @Post('profile/:peopleId')
    @UseInterceptors(FileInterceptor('profileImage'))
    async uploadProfileImage(
      @Param('peopleId') peopleId: string,
      @UploadedFile() file: MulterFile,
    ) {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }
  
      try {
        // Buscar el perfil de la persona
        const person = await this.peopleService.findById(peopleId);
        if (!person) {
          throw new NotFoundException(`Persona con ID ${peopleId} no encontrada`);
        }
  
        // Si ya tiene una imagen de perfil, eliminarla
        if (person.profileImage) {
          const oldImagePath = this.getLocalPathFromUrl(person.profileImage);
          await this.uploadService.deleteFile(oldImagePath);
        }
  
        // Generar la URL para la nueva imagen
        const imageUrl = this.uploadService.getFileUrl(file.path);
  
        // Actualizar el perfil con la nueva imagen
        await this.peopleService.update(peopleId, {
          profileImage: imageUrl,
        });
  
        return {
          success: true,
          message: 'Imagen de perfil actualizada correctamente',
          profileImage: imageUrl,
        };
      } catch (error) {
        throw new BadRequestException(
          `Error al procesar la imagen: ${error.message}`,
        );
      }
    }
  
    @Delete('profile/:peopleId')
    async deleteProfileImage(@Param('peopleId') peopleId: string) {
      const person = await this.peopleService.findById(peopleId);
      if (!person) {
        throw new NotFoundException(`Persona con ID ${peopleId} no encontrada`);
      }
  
      if (!person.profileImage) {
        throw new BadRequestException('La persona no tiene imagen de perfil');
      }
  
      // Obtener la ruta local del archivo
      const imagePath = this.getLocalPathFromUrl(person.profileImage);
  
      // Eliminar el archivo
      const deleted = await this.uploadService.deleteFile(imagePath);
  
      if (!deleted) {
        throw new BadRequestException('No se pudo eliminar la imagen de perfil');
      }
  
      // Actualizar el perfil para quitar la referencia a la imagen
      await this.peopleService.update(peopleId, {
        profileImage: '', // Cambio de null a string vacía para evitar error de tipo
      });
  
      return {
        success: true,
        message: 'Imagen de perfil eliminada correctamente',
      };
    }
  
    /**
     * Convierte una URL de archivo a una ruta local en el sistema
     */
    private getLocalPathFromUrl(fileUrl: string): string {
      // Extraer la parte relativa a uploads
      const relativePath = fileUrl.substring(fileUrl.indexOf('uploads'));
      return join(process.cwd(), relativePath);
    }
  }