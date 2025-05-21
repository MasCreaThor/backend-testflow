// src/shared/interceptors/timeout.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException, Logger } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

/**
 * Interceptor que establece un tiempo máximo para procesar solicitudes
 * 
 * Este interceptor detiene cualquier solicitud que exceda el tiempo máximo configurado
 * y devuelve un error de timeout (HTTP 408) en lugar de permitir que la solicitud
 * se ejecute indefinidamente.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInterceptor.name);
  private readonly timeoutMs: number;

  constructor(private configService: ConfigService) {
    // Obtener el timeout desde la configuración o usar un valor por defecto
    this.timeoutMs = this.configService.get<number>('app.requestTimeout') || 30000; // 30 segundos por defecto
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          this.logger.warn(
            `Solicitud ${method} ${url} excedió el tiempo máximo de ${this.timeoutMs}ms`
          );
          return throwError(() => new RequestTimeoutException(
            `La solicitud excedió el tiempo máximo de espera (${this.timeoutMs / 1000} segundos)`
          ));
        }
        return throwError(() => err);
      }),
    );
  }
}