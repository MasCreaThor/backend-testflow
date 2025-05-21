import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';

let cachedApp: any = null;

async function createApp() {
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

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: [
      process.env.APP_URL || 'http://localhost:3000',
      'https://testflow-frontend.vercel.app', // Update with your actual frontend URL
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api', { exclude: ['/'] });

  await app.init();
  
  cachedApp = expressApp;
  return expressApp;
}

export default async (req: any, res: any) => {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};