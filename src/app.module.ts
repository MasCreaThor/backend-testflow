// src/app.module.ts - Versión súper minimalista
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// Módulo de configuración centralizado
import { ConfigModule } from './config/config.module';

// Shared básico
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ValidationPipe } from './shared/pipes/validation.pipe';
import { LoggerService } from './shared/services/logger.service';

// Módulos de la aplicación
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { PeopleModule } from './modules/people/people.module';
import { StudyGoalsModule } from './modules/study-goals/study-goals.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { RolesModule } from './modules/roles/roles.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './health/health.module';

// Controlador y servicio base
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuración
    ConfigModule,
    
    // MongoDB con configuración minimalista
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        console.log('🔗 Connecting to MongoDB...');
        
        // CONFIGURACIÓN SÚPER SIMPLE - Solo la URI
        return { uri };
      },
    }),
    
    // Módulos
    AuthModule,
    UsersModule,
    EmailModule,
    PeopleModule,
    StudyGoalsModule,
    CategoriesModule,
    RolesModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}