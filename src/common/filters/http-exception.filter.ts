// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    
    const exceptionResponse = exception.getResponse();
    
    // Handle both string and object responses from exceptions
    const errorResponse = typeof exceptionResponse === 'object'
      ? exceptionResponse
      : { message: exceptionResponse };
    
    // Create a standardized error response
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...errorResponse,
    };
    
    // Log the error with helpful debug information
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
      exception.stack,
      HttpExceptionFilter.name,
    );
    
    response.status(status).json(responseBody);
  }
}