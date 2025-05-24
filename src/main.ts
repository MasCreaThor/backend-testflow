import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const nestApp = await bootstrap();
    const httpAdapter = nestApp.getHttpAdapter();
    await httpAdapter.getInstance()(req, res);
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
  bootstrap().then(app => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Servidor ejecutándose en: http://localhost:${port}`);
    });
  });
}