import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express, { Express } from 'express';

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
      logger: ['error', 'warn', 'log'],
    }
  );

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

  await app.init();

  cachedApp = expressApp;
  return expressApp;
}

// Handler para Vercel
export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    // Cast para evitar error TS2349
    (app as any)(req, res);
  } catch (error) {
    console.error('Error en función serverless:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
    });
  }
}

// Desarrollo local
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

if (require.main === module) {
  bootstrap();
}
