import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

let app: any;

async function bootstrap() {
  if (!app) {
    const expressApp = express();
    app = await NestFactory.create(
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
  }
  return app.getHttpAdapter().getInstance();
}

// Función para manejo serverless (Vercel)
export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  server(req, res);
}

// Desarrollo local
if (require.main === module) {
  bootstrap().then(server => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`Aplicación ejecutándose en: http://localhost:${port}`);
    });
  });
}