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
  
  // SOLUCIÓN: Simplificar middleware para Vercel
  if (process.env.NODE_ENV !== 'production') {
    // Solo usar middleware completo en desarrollo
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
      }) as any
    );
    app.use(compression());
  }

  // Configuración de CORS simplificada para producción
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:3000', 'https://frontend-testflow.vercel.app/', 'http://127.0.0.1:3000'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
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
  
  // SOLUCIÓN: En Vercel, no ejecutar listen
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('Bootstrap completed for Vercel serverless');
    return app;
  }

  // Solo para desarrollo local
  const port = process.env.PORT || configService.get<number>('app.port') || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api-docs`);
  
  return app;
}

// Para Vercel - export directo
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  module.exports = bootstrap;
} else {
  bootstrap();
}