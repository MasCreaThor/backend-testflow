import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';

const server = express();
let app: any = null;
let isInitializing = false;

export default async (req: any, res: any) => {
  try {
    // Si ya hay una app inicializada, úsala
    if (app) {
      return server(req, res);
    }

    // Si ya se está inicializando, esperar
    if (isInitializing) {
      // Esperar hasta que la inicialización termine
      let attempts = 0;
      while (isInitializing && attempts < 100) { // 10 segundos máximo
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (app) {
        return server(req, res);
      } else {
        throw new Error('App initialization failed');
      }
    }

    // Marcar que se está inicializando
    isInitializing = true;
    
    console.log('🚀 Creating NestJS app for Vercel...');
    const startTime = Date.now();

    // Crear la aplicación con configuración optimizada para serverless
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { 
        logger: ['error', 'warn'],
        bufferLogs: true,
        abortOnError: false
      }
    );

    // CORS simple y permisivo para Vercel
    app.enableCors({
      origin: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      credentials: true,
    });

    // Configurar prefijo global
    app.setGlobalPrefix('api');

    // Configuración específica para Vercel
    app.use('/api/health', (req: any, res: any) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Inicializar sin escuchar puerto (modo serverless)
    await app.init();
    
    const initTime = Date.now() - startTime;
    console.log(`✅ NestJS app initialized successfully in ${initTime}ms`);
    
    // Marcar inicialización como completa
    isInitializing = false;

    return server(req, res);
    
  } catch (error) {
    isInitializing = false;
    console.error('❌ Error initializing NestJS app:', error);
    
    // Responder con error 500
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to initialize application',
        timestamp: new Date().toISOString()
      });
    }
  }
};