import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let nestApp: any;

async function createServer() {
  if (!nestApp) {
    const server = express();
    nestApp = await NestFactory.create(
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
  }
  return nestApp.getHttpAdapter().getInstance();
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const server = await createServer();
    server(req, res);
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
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