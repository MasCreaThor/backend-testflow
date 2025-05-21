import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  try {
    console.log('Starting TestFlow API application...');
    
    const app = await NestFactory.create(AppModule, {
      bodyParser: true,
      rawBody: true,
    });
    
    console.log('Application created successfully');
    
    const configService = app.get(ConfigService);
    
    // Middleware setup
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
      })
    );
    app.use(compression());

    // CORS Configuration
    const allowedOrigins = [
      'https://testflow-frontend.vercel.app', // Update with your actual frontend URL
      'http://localhost:3000',
    ];
    
    console.log('Setting up CORS with allowed origins:', allowedOrigins);
    
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      exposedHeaders: ['Authorization'],
      credentials: true,
      maxAge: 3600,
    });

    // Swagger setup
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('TestFlow API')
        .setDescription('API para la aplicación TestFlow')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document);
      console.log('Swagger documentation enabled at /api-docs');
    }
    
    // Get port from environment or use default
    const port = process.env.PORT || 3000;
    
    await app.listen(port);
    console.log(`Application is running on port: ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Database connection configured');
    
    // Log database connection info (but not credentials)
    const dbUri = configService.get<string>('DATABASE_URI') || 'Not configured';
    console.log(`Database URI configured: ${dbUri ? 'Yes' : 'No'}`);
    
    return app;
  } catch (error) {
    console.error('Error starting application:', error);
    throw error;
  }
}

// Export the bootstrap function for better error handling in serverless environments
export default bootstrap();