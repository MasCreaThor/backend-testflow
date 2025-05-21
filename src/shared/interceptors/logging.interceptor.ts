// src/shared/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor para registrar información sobre las solicitudes HTTP
 * 
 * Este interceptor registra información sobre cada solicitud HTTP:
 * - Cuándo comenzó
 * - Método y URL
 * - Cuánto tiempo tardó en procesarse
 * - Si fue exitosa o produjo un error
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Obtener información de la solicitud
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('user-agent') || 'unknown';
    const ip = this.getClientIp(request);
    
    // Registrar el inicio de la solicitud
    const startTime = Date.now();
    this.logger.log(`Solicitud ${method} ${url} iniciada | IP: ${ip} | User-Agent: ${userAgent}`);

    // Manejar la solicitud y registrar su finalización
    return next
      .handle()
      .pipe(
        tap({
          next: (res) => {
            const duration = Date.now() - startTime;
            this.logger.log(
              `Solicitud ${method} ${url} completada | Duración: ${duration}ms | Status: OK`
            );
          },
          error: (err) => {
            const duration = Date.now() - startTime;
            this.logger.error(
              `Solicitud ${method} ${url} falló | Duración: ${duration}ms | Status: ERROR - ${err.message}`,
              err.stack
            );
          },
        }),
      );
  }

  /**
   * Extrae la dirección IP del cliente
   */
  private getClientIp(request: any): string {
    // Intentar obtener IP de headers de proxy (para casos detrás de balanceadores, etc.)
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',');
      return ips[0].trim();
    }
    
    // Alternativas para obtener la IP
    return (
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}