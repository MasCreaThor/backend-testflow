import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let app: any = null;

async function bootstrap() {
  if (app) {
    return app;
  }

  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  nestApp.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await nestApp.init();
  app = expressApp;
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    return new Promise((resolve, reject) => {
      server(req, res, (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(undefined);
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Solo para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(server => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`Servidor ejecutándose en: http://localhost:${port}`);
    });
  });
}