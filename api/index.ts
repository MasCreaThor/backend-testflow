import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';

const server = express();

export default async (req: any, res: any) => {
  if (!global.__nestApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { 
        logger: ['error', 'warn', 'log'],
        bodyParser: true 
      }
    );

    // Configurar CORS para Vercel
    app.enableCors({
      origin: process.env.FRONTEND_URL || true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      credentials: true,
    });

    // Configurar prefijo global
    app.setGlobalPrefix('api');

    await app.init();
    global.__nestApp = app;
  }

  return server(req, res);
};