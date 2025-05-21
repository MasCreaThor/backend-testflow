// src/shared/services/logger.service.ts
import { Injectable, LoggerService as NestLoggerService, LogLevel, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de registro centralizado y configurable
 * 
 * Características:
 * - Configuración de niveles de log basada en entorno
 * - Formateo consistente de mensajes
 * - Soporte para contextos específicos
 * - Gestión centralizada para futuras integraciones con sistemas de logs
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private logLevels: LogLevel[];
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    // Determinar entorno y configurar niveles de log
    const environment = this.configService.get<string>('app.environment') || 'development';
    this.isProduction = environment === 'production';
    
    // En producción solo mostramos log, warn y error
    // En desarrollo/testing mostramos todos los niveles
    this.logLevels = this.isProduction 
      ? ['log', 'warn', 'error']
      : ['log', 'warn', 'error', 'debug', 'verbose'];
  }

  /**
   * Establece el contexto para los mensajes de log
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Registra un mensaje informativo
   */
  log(message: any, context?: string): void {
    if (this.isLevelEnabled('log')) {
      this.printMessage('INFO', message, context || this.context);
    }
  }

  /**
   * Registra un mensaje de error
   */
  error(message: any, trace?: string, context?: string): void {
    if (this.isLevelEnabled('error')) {
      this.printMessage('ERROR', message, context || this.context, 'red');
      if (trace) {
        console.error(this.colorize(trace, 'red'));
      }
    }
  }

  /**
   * Registra un mensaje de advertencia
   */
  warn(message: any, context?: string): void {
    if (this.isLevelEnabled('warn')) {
      this.printMessage('WARN', message, context || this.context, 'yellow');
    }
  }

  /**
   * Registra un mensaje de depuración
   */
  debug(message: any, context?: string): void {
    if (this.isLevelEnabled('debug')) {
      this.printMessage('DEBUG', message, context || this.context, 'blue');
    }
  }

  /**
   * Registra un mensaje detallado
   */
  verbose(message: any, context?: string): void {
    if (this.isLevelEnabled('verbose')) {
      this.printMessage('VERBOSE', message, context || this.context, 'gray');
    }
  }

  /**
   * Verifica si un nivel de log está habilitado
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }

  /**
   * Formatea y muestra un mensaje en consola
   */
  private printMessage(
    level: string,
    message: any,
    context?: string,
    color?: string
  ): void {
    // Formatear el mensaje para facilitar la lectura y análisis
    const output = this.formatMessage(level, message, context);
    
    // Aplicar colores en entornos no productivos
    const finalOutput = !this.isProduction && color 
      ? this.colorize(output, color)
      : output;
    
    // Imprimir mensaje
    console.log(finalOutput);
    

  }

  /**
   * Formatea un mensaje de log con timestamp, nivel, contexto y contenido
   */
  private formatMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatContent(message);
    const contextStr = context ? `[${context}]` : '';
    
    return `${timestamp} ${level.padEnd(7)} ${contextStr.padEnd(15)} - ${formattedMessage}`;
  }

  /**
   * Formatea el contenido del mensaje según su tipo
   */
  private formatContent(content: any): string {
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content);
      } catch (e) {
        return `[Object: ${typeof content}]`;
      }
    }
    return String(content);
  }

  /**
   * Aplica colores ANSI a la consola (solo en entornos no productivos)
   */
  private colorize(text: string, color: string): string {
    if (this.isProduction) return text;
    
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      reset: '\x1b[0m',
    };
    
    return `${colors[color] || ''}${text}${colors.reset}`;
  }
}