import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

let cachedApp: express.Express | null = null;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: process.env.NODE_ENV === 'production' ? false : ['error', 'warn', 'log'],
    }
  );

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // CORS configuration
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
  
  cachedApp = expressApp;
  return expressApp;
}

// For serverless environment
export default async (req: any, res: any) => {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

// For local development
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    app.enableCors({
      origin: ['http://localhost:3000'],
      credentials: true,
    });
    
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }
}

// Run bootstrap only in development
if (require.main === module) {
  bootstrap();
}