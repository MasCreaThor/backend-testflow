// src/health/services/database-health.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class DatabaseHealthService extends HealthIndicator {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }

  /**
   * Verifica el estado de salud de la conexión a MongoDB
   * @param key Clave para el resultado del health check
   * @returns Resultado del health check
   */
  async checkMongoDB(key: string): Promise<HealthIndicatorResult> {
    this.logger.debug('Verificando conexión a MongoDB');
    
    try {
      // Verificar el estado de la conexión
      const readyState = this.connection.readyState;
      
      // Mapeo de estados de conexión
      const states = {
        0: 'Desconectado',
        1: 'Conectado',
        2: 'Conectando',
        3: 'Desconectando',
      };
      
      const isHealthy = readyState === 1;
      
      if (isHealthy) {
        this.logger.log('Conexión a MongoDB establecida correctamente');
        
        // Verificar que la conexión y db existan
        if (!this.connection || !this.connection.db) {
          throw new Error('La conexión a la base de datos no está disponible');
        }
        
        // Ejecutar ping para comprobar la respuesta
        const adminDb = this.connection.db.admin();
        const pingResult = await adminDb.ping();
        
        const serverInfo = await this.getServerInfo();
        
        return this.getStatus(key, true, {
          readyState: states[readyState],
          ping: pingResult.ok === 1 ? 'success' : 'failed',
          version: serverInfo.version,
          uptime: `${(serverInfo.uptime / 3600).toFixed(2)} horas`,
        });
      }
      
      this.logger.warn(`Conexión a MongoDB en estado: ${states[readyState]}`);
      throw new Error(`Database connection is ${states[readyState]}`);
    } catch (error) {
      this.logger.error(`Error al verificar la conexión a MongoDB: ${error.message}`);
      throw new HealthCheckError(
        'MongoDB health check failed',
        this.getStatus(key, false, {
          error: error.message,
        }),
      );
    }
  }

  /**
   * Obtiene información del servidor MongoDB
   * @returns Información del servidor
   */
  private async getServerInfo(): Promise<any> {
    try {
      // Verificar que la conexión y db existan
      if (!this.connection || !this.connection.db) {
        throw new Error('La conexión a la base de datos no está disponible');
      }
      
      // Obtener información del servidor
      const adminDb = this.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      return {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        connections: serverStatus.connections,
      };
    } catch (error) {
      this.logger.error(`Error al obtener información del servidor: ${error.message}`);
      return {
        version: 'Desconocida',
        uptime: 0,
        connections: { current: 0 },
      };
    }
  }
  
  /**
   * Realiza una prueba más completa de la base de datos
   * @returns Resultado detallado de las pruebas
   */
  async runDiagnostics(): Promise<any> {
    this.logger.log('Ejecutando diagnóstico completo de MongoDB');
    
    try {
      // Validar conexión
      const readyState = this.connection.readyState;
      if (readyState !== 1) {
        return {
          status: 'error',
          connection: 'failed',
          message: 'No hay conexión activa a MongoDB',
        };
      }
      
      // Obtener información del servidor
      const serverInfo = await this.getServerInfo();
      
      // Verificar que la conexión y db existan
      if (!this.connection || !this.connection.db) {
        throw new Error('La conexión a la base de datos no está disponible');
      }
      
      // Probar operación de lectura/escritura en una colección temporal
      const db = this.connection.db;
      const testCollection = db.collection('connectionTest');
      
      // Limpiar colección anterior si existe
      await testCollection.deleteMany({});
      
      // Insertar un documento de prueba
      const writeResult = await testCollection.insertOne({
        test: true,
        timestamp: new Date(),
      });
      
      // Leer el documento insertado
      const readResult = await testCollection.findOne({ test: true });
      
      // Eliminar el documento de prueba
      const deleteResult = await testCollection.deleteMany({ test: true });
      
      return {
        status: 'success',
        connection: 'active',
        serverInfo,
        tests: {
          write: writeResult.acknowledged ? 'success' : 'failed',
          read: readResult ? 'success' : 'failed',
          delete: deleteResult.acknowledged ? 'success' : 'failed',
        },
      };
    } catch (error) {
      this.logger.error(`Error durante el diagnóstico: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}