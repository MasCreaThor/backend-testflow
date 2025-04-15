// src/common/exceptions/app-exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception class for application-specific exceptions
 */
export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code?: string,
    public readonly details?: any,
  ) {
    super(
      {
        statusCode: status,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

/**
 * Exception for when a requested resource is not found
 */
export class NotFoundException extends AppException {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    details?: any,
  ) {
    super(message, HttpStatus.NOT_FOUND, code, details);
  }
}

/**
 * Exception for when there's a conflict with the current state of the resource
 */
export class ConflictException extends AppException {
  constructor(
    message: string = 'Conflict with the current state of the resource',
    code: string = 'CONFLICT',
    details?: any,
  ) {
    super(message, HttpStatus.CONFLICT, code, details);
  }
}

/**
 * Exception for when a request is invalid
 */
export class BadRequestException extends AppException {
  constructor(
    message: string = 'Invalid request',
    code: string = 'BAD_REQUEST',
    details?: any,
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, details);
  }
}

/**
 * Exception for when a user is not authorized to perform an action
 */
export class UnauthorizedException extends AppException {
  constructor(
    message: string = 'Unauthorized',
    code: string = 'UNAUTHORIZED',
    details?: any,
  ) {
    super(message, HttpStatus.UNAUTHORIZED, code, details);
  }
}

/**
 * Exception for when access to a resource is forbidden
 */
export class ForbiddenException extends AppException {
  constructor(
    message: string = 'Forbidden',
    code: string = 'FORBIDDEN',
    details?: any,
  ) {
    super(message, HttpStatus.FORBIDDEN, code, details);
  }
}

/**
 * Exception for internal server errors
 */
export class InternalServerErrorException extends AppException {
  constructor(
    message: string = 'Internal server error',
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: any,
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, code, details);
  }
}