import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';

const server = express();
let app: any;

export default async (req: any, res: any) => {
  // Solo crear la app una vez y reutilizarla
  if (!app) {
    console.log('Creating NestJS app for Vercel...');
    
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { 
        logger: ['error', 'warn', 'log'],
        bodyParser: true 
      }
    );

    // Configurar CORS simple para Vercel
    app.enableCors({
      origin: true, // Permitir todos los orígenes temporalmente
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      credentials: true,
    });

    // Configurar prefijo global
    app.setGlobalPrefix('api');

    // IMPORTANTE: Inicializar la aplicación sin escuchar puerto
    await app.init();
    console.log('NestJS app initialized successfully');
  }

  // Manejar la request con la app ya inicializada
  return server(req, res);
};