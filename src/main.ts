import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';

const helmet = require('helmet');

declare global {
  var __nestApp: any;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
    bodyParser: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  
  // Middleware de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    }) as any
  );
  
  // SOLUCIÓN: Solo usar compression en desarrollo, no en producción/Vercel
  if (process.env.NODE_ENV !== 'production') {
    app.use(compression());
  }

  // Configuración de CORS mejorada para producción
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? allowedOrigins
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 3600,
  });

  // Solo configurar Swagger en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('TestFlow API')
      .setDescription('API para la aplicación TestFlow')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }
  
  // Puerto de la aplicación
  const port = process.env.PORT || configService.get<number>('app.port') || 3001;
  
  // Solo escuchar en puerto si no estamos en Vercel
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger documentation available at: ${await app.getUrl()}/api-docs`);
  }

  return app;
}

// Para Vercel
if (process.env.VERCEL) {
  module.exports = bootstrap;
} else {
  bootstrap();
}