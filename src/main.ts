import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

let cachedApp: express.Express | null = null;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn', 'log'], // Habilitamos logs básicos para ambos entornos
    }
  );

  // Configuración de ValidationPipe global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Configuración de CORS
  app.enableCors({
    origin: [
      process.env.APP_URL,
      'https://testflow-frontend.vercel.app',
      'http://localhost:3000',
    ].filter(Boolean),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  await app.init();
  
  cachedApp = expressApp;
  return expressApp;
}

// Función para manejo serverless (Vercel)
export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    app(req, res);
  } catch (error) {
    console.error('Error en función serverless:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
    });
  }
}

// Función para desarrollo local
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.enableCors({
    origin: [
      process.env.APP_URL,
      'https://testflow-frontend.vercel.app',
      'http://localhost:3000',
    ].filter(Boolean),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Aplicación ejecutándose en: http://localhost:${port}`);
}

// Ejecutar bootstrap solo en desarrollo
if (require.main === module) {
  bootstrap();
}