// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

// Módulo de configuración centralizado
import { ConfigModule } from './config/config.module';

// Shared - Filtros, pipes, interceptores
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ValidationPipe } from './shared/pipes/validation.pipe';
import { 
  TransformResponseInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor 
} from './shared/interceptors';

// Shared - Servicios
import { LoggerService } from './shared/services/logger.service';

// Módulos de la aplicación
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { PeopleModule } from './modules/people/people.module';
import { StudyGoalsModule } from './modules/study-goals/study-goals.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { RolesModule } from './modules/roles/roles.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './health/health.module';

// Controlador y servicio base
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Módulo principal de la aplicación optimizado para Vercel
 */
@Module({
  imports: [
    // Módulo de configuración centralizada
    ConfigModule,
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        if (!uri) {
          console.error('DATABASE_URI/MONGODB_URI is not configured!');
          throw new Error('Database URI is required');
        }
        
        console.log('🔗 Connecting to MongoDB...');
        
        // SOLUCIÓN: Configuración optimizada para serverless
        return {
          uri,
          // Timeouts más cortos para serverless
          connectTimeoutMS: 10000,  // 10 segundos
          socketTimeoutMS: 15000,   // 15 segundos  
          serverSelectionTimeoutMS: 10000, // 10 segundos
          // Pool más pequeño para serverless
          maxPoolSize: 5,
          minPoolSize: 1,
          // Configuraciones para mejor rendimiento en serverless
          heartbeatFrequencyMS: 30000, // 30 segundos
          bufferMaxEntries: 0, // Desactivar buffering
          bufferCommands: false, // No usar buffer
          // Configuraciones adicionales
          retryWrites: true,
          w: 'majority',
          // Para conexiones serverless
          maxIdleTimeMS: 30000, // 30 segundos antes de cerrar conexiones inactivas
        };
      },
    }),

    // Servir archivos estáticos - Solo en desarrollo
    ...(process.env.NODE_ENV !== 'production' && !process.env.VERCEL ? [
      ServeStaticModule.forRoot({
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/uploads',
        serveStaticOptions: {
          etag: true,
          maxAge: 86400000, // 1 día
        }
      })
    ] : []),
    
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    EmailModule,
    PeopleModule,
    StudyGoalsModule,
    CategoriesModule,
    RolesModule,
    // UploadModule, // TEMPORALMENTE DESHABILITADO PARA VERCEL
    AdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    // Servicio base
    AppService,
    
    // Servicio de logging
    LoggerService,
    
    // Filtro de excepciones global
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    
    // Pipe de validación global
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    
    // Interceptores globales - Solo en desarrollo para reducir overhead
    ...(process.env.NODE_ENV !== 'production' ? [
      {
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
      },
    ] : []),
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}