import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

let cachedApp: express.Express | null = null;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const expressApp = express();
    
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: false, // Disable logging in production
      }
    );

    // Enable validation pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    // Enable CORS
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

    // Initialize the NestJS application
    await app.init();
    
    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    console.error('Error creating NestJS app:', error);
    throw error;
  }
}

export default async (req: any, res: any) => {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
    });
  }
};