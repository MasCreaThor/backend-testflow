import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let app: any;

async function createServer() {
  const server = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );

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
  return server;
}

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = await createServer();
    }
    app(req, res);
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error interno del servidor');
  }
}

// Solo para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  createServer().then(server => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`Servidor ejecutándose en: http://localhost:${port}`);
    });
  });
}