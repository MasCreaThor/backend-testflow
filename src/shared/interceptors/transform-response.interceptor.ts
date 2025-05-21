// src/shared/interceptors/transform-response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interfaz que define la estructura estándar de respuesta de la API
 */
export interface Response<T> {
  data: T;                     // Datos de la respuesta
  statusCode: number;          // Código HTTP de estado
  message?: string;            // Mensaje descriptivo (opcional)
  timestamp: string;           // Marca de tiempo en ISO format
  path: string;                // Ruta de la solicitud
  metadata?: Record<string, any>; // Metadatos adicionales
}

/**
 * Interceptor que transforma todas las respuestas a un formato estandarizado
 * 
 * Este interceptor captura la respuesta original de cualquier controlador
 * y la envuelve en un objeto con formato estándar que incluye metadatos adicionales.
 */
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    return next
      .handle()
      .pipe(
        map(data => {
          // Manejar respuestas que ya tienen formato específico
          if (data && data.statusCode && data.message) {
            return {
              ...data,
              timestamp: new Date().toISOString(),
              path: request.url,
            };
          }
          
          // Formato estándar para otras respuestas
          return {
            data,
            statusCode: response.statusCode,
            message: this.getDefaultMessageForStatus(response.statusCode),
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }),
      );
  }

  /**
   * Genera un mensaje descriptivo basado en el código de estado HTTP
   */
  private getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 200:
        return 'Operación completada con éxito';
      case 201:
        return 'Recurso creado con éxito';
      case 204:
        return 'Recurso eliminado con éxito';
      default:
        return 'Solicitud procesada';
    }
  }
}