// src/modules/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './services/upload.service';
import { ProfileUploadController } from './controllers/profile-upload.controller';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PeopleModule } from '../people/people.module';

@Module({
  imports: [
    ConfigModule,
    PeopleModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          const profileImagesPath = join(uploadPath, 'profile-images');
          const documentsPath = join(uploadPath, 'documents');
          
          // Determinar el destino según el tipo de archivo
          if (file.fieldname === 'profileImage') {
            cb(null, profileImagesPath);
          } else if (file.fieldname === 'document') {
            cb(null, documentsPath);
          } else {
            cb(null, uploadPath); // Por defecto
          }
        },
        filename: (req, file, cb) => {
          // Generar nombre único para el archivo
          const uniqueFilename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueFilename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validación de tipos de archivo permitidos
        if (file.fieldname === 'profileImage') {
          // Solo permitir imágenes para fotos de perfil
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(
              new Error('Solo se permiten imágenes (jpg, jpeg, png, gif)'), 
              false
            );
          }
        } else if (file.fieldname === 'document') {
          // Solo permitir PDFs para documentos
          if (file.mimetype !== 'application/pdf') {
            return cb(
              new Error('Solo se permiten archivos PDF'), 
              false
            );
          }
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
      },
    }),
  ],
  controllers: [ProfileUploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}