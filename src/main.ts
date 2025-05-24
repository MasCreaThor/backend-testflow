import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

let cachedServer: express.Express | null = null;

async function bootstrap() {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
  });

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
  
  cachedServer = expressApp;
  return expressApp;
}

// Handler para Vercel
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    try {
      cachedServer = await bootstrap();
    } catch (error) {
      console.error('Error initializing server:', error);
      return res.status(500).json({
        message: 'Error initializing server',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  return cachedServer(req, res);
}

// Solo para desarrollo local
if (require.main === module) {
  bootstrap().then(server => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`Aplicación ejecutándose en: http://localhost:${port}`);
    });
  });
}