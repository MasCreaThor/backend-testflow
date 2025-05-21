import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as helmet from 'helmet';

async function bootstrap() {
  try {
    console.log('Starting TestFlow API application...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    console.log('Application created successfully');
    
    const configService = app.get(ConfigService);
    
    // Middleware setup
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
    app.use(compression());

    // CORS Configuration
    const allowedOrigins = [
      process.env.APP_URL || 'http://localhost:3000',
      'https://frontend-testflow.vercel.app',
    ];
    
    console.log('Setting up CORS with allowed origins:', allowedOrigins);
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      exposedHeaders: ['Authorization'],
      credentials: true,
    });

    // Swagger setup for development
    const config = new DocumentBuilder()
      .setTitle('TestFlow API')
      .setDescription('API para la aplicación TestFlow')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    console.log('Swagger documentation enabled at /api-docs');
    
    // Get port from environment or use default
    const port = process.env.PORT || 3001;
    
    await app.listen(port);
    console.log(`Application is running on port: ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    return app;
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

// Only run bootstrap if this file is executed directly (not imported)
if (require.main === module) {
  bootstrap();
}