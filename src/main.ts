// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as fs from 'fs';
import * as YAML from 'js-yaml';
import * as path from 'path';

// Usar require para helmet como lo teníamos antes
const helmet = require('helmet');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Middleware de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: false, // Deshabilitar CSP para desarrollo
    }) as any
  );
  app.use(compression());

  // Configuración de CORS (modificada)
  app.enableCors({
    origin: true,  // Permitir todas las origenes en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de Swagger con archivo YAML externo
  const swaggerYamlPath = path.join(process.cwd(), 'swagger', 'api-docs.yaml');
  let swaggerDocument;

  if (fs.existsSync(swaggerYamlPath)) {
    // Si el archivo YAML existe, cárgalo
    const yamlContent = fs.readFileSync(swaggerYamlPath, 'utf8');
    swaggerDocument = YAML.load(yamlContent);
  } else {
    // Si no existe, crea uno básico
    const config = new DocumentBuilder()
      .setTitle('TestFlow API')
      .setDescription('API para la aplicación TestFlow')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    swaggerDocument = SwaggerModule.createDocument(app, config);
    
    // Asegúrate de que el directorio exista
    if (!fs.existsSync(path.join(process.cwd(), 'swagger'))) {
      fs.mkdirSync(path.join(process.cwd(), 'swagger'));
    }
    
    // Guarda el documento como YAML
    fs.writeFileSync(
      swaggerYamlPath,
      YAML.dump(swaggerDocument),
      'utf8'
    );
  }
  
  SwaggerModule.setup('api-docs', app, swaggerDocument);
  
  // Puerto de la aplicación
  const port = configService.get<number>('app.port') ?? 3001;
  
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api-docs`);
  console.log(`Servidor corriendo en: http://localhost:${port}`);
}
bootstrap();