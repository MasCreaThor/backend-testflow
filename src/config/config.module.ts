// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import emailConfig from './email.config';

/**
 * Módulo de configuración centralizado que carga todos los archivos de configuración
 * y los hace disponibles globalmente en la aplicación.
 * 
 * Características:
 * - Carga configuraciones desde variables de entorno y archivos .env
 * - Permite acceder a valores de configuración tipados
 * - Cachea las configuraciones para mejor rendimiento
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la aplicación sin importarlo
      cache: true, // Mejora el rendimiento cacheando los valores
      load: [
        appConfig,
        databaseConfig, 
        jwtConfig, 
        emailConfig
      ],
      expandVariables: true, // Permite referencias entre variables de entorno
      envFilePath: [
        '.env',
        '.env.local',
        `.env.${process.env.NODE_ENV || 'development'}`
      ],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}