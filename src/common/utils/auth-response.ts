import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: Array<{
    path?: string;
    message: string;
    code?: string;
  }>;
  timestamp: string;
  path?: string;
}

export class AuthResponseFormatter {
  /**
   * Format successful response
   */
  static success<T = any>(
    data: T,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK,
    path?: string,
  ): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Format error response
   */
  static error(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    errors?: Array<{ path?: string; message: string; code?: string }>,
    path?: string,
  ): ApiResponse {
    return {
      statusCode,
      message,
      errors: errors || [],
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Format validation error response
   */
  static validationError(
    message: string = 'Validation failed',
    errors: Array<{ path?: string; message: string; code?: string }> = [],
    path?: string,
  ): ApiResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Format unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized',
    path?: string,
  ): ApiResponse {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Format forbidden response
   */
  static forbidden(message: string = 'Forbidden', path?: string): ApiResponse {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Format not found response
   */
  static notFound(message: string = 'Not found', path?: string): ApiResponse {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Format internal server error response
   */
  static internalServerError(
    message: string = 'Internal server error',
    path?: string,
  ): ApiResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }
}
