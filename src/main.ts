// src/main.ts - ARCHIVO COMPLETO PARA EL BACKEND
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
  const app = await NestFactory.create(AppModule, {
    // Aumentar el límite de solicitud y respuesta para solucionar problemas de parsing JSON
    bodyParser: true,
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  
  // Middleware de seguridad - MODIFICADO para desarrollo
  app.use(
    helmet({
      contentSecurityPolicy: false, // Deshabilitar CSP para desarrollo
      crossOriginEmbedderPolicy: false, // Deshabilitar COEP para desarrollo
      crossOriginOpenerPolicy: false, // Deshabilitar COOP para desarrollo
      crossOriginResourcePolicy: false, // Deshabilitar CORP para desarrollo
    }) as any
  );
  app.use(compression());

  // Configuración de CORS mejorada
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Especificar orígenes exactos en desarrollo
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'], // Importante para interceptor de autorización
    credentials: true, // Permitir cookies y credenciales
    maxAge: 3600, // Tiempo en segundos que el navegador puede cachear la respuesta preflight
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
  console.log(`Abre este link para la conección de la BD (modo dev) en: mongodb://localhost:27017/testflow`);
}
bootstrap();