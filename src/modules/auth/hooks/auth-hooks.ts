import { createAuthMiddleware, APIError } from 'better-auth/api';
import { AuthResponseFormatter } from '@/common/utils/auth-response';

/**
 * After hook untuk format response (success & error) dengan custom API response
 * Menggunakan APIError dari better-auth untuk set HTTP status code dengan benar
 */
export const authResponseHook = createAuthMiddleware(async (ctx) => {
  // Hanya process POST requests
  if (ctx.request?.method !== 'POST') {
    return;
  }

  try {
    // Cek jika ada returned value dari endpoint
    if (ctx.context.returned) {
      const returned = ctx.context.returned as Record<string, unknown>;

      // Handle error response dari Better Auth
      if (returned instanceof Error || returned?.error) {
        // Extract error details from returned object
        const retObj = returned as Record<string, unknown> | null;
        const errorCode = retObj?.code;
        const errorMessage = retObj?.message;

        const statusCode = getErrorStatusCode(
          typeof errorCode === 'string' ? errorCode : 'BAD_REQUEST',
        );

        // Throw APIError dengan status code yang benar
        throw new APIError(getErrorAPIStatus(statusCode), {
          message: String(errorMessage) || 'An error occurred',
          code: typeof errorCode === 'string' ? errorCode : undefined,
        });
      }

      // Handle success response
      let message = 'Success';
      let statusCode = 200;

      // Determine message dan status code berdasarkan path
      if (ctx.path.includes('/sign-up')) {
        message = 'User registered successfully';
        statusCode = 201;
      } else if (ctx.path.includes('/sign-in')) {
        message = 'User signed in successfully';
        statusCode = 200;
      } else if (ctx.path.includes('/change-password')) {
        message = 'Password changed successfully';
        statusCode = 200;
      } else if (ctx.path.includes('/verify-email')) {
        message = 'Email verified successfully';
        statusCode = 200;
      } else if (ctx.path.includes('/forget-password')) {
        message = 'Password reset email sent successfully';
        statusCode = 200;
      } else if (ctx.path.includes('/reset-password')) {
        message = 'Password reset successfully';
        statusCode = 200;
      } else if (ctx.path.includes('/sign-out')) {
        message = 'User signed out successfully';
        statusCode = 200;
      }

      const formattedResponse = AuthResponseFormatter.success(
        returned,
        message,
        statusCode,
        ctx.path,
      );

      // Return success response
      return ctx.json(formattedResponse, {
        status: statusCode,
      });
    }
  } catch (error) {
    // Jika error dari Better Auth, re-throw dengan format response
    if (error instanceof APIError) {
      throw error;
    }
    throw error;
  }
});

/**
 * Convert error code ke HTTP status code
 */
function getErrorStatusCode(errorCode: string): number {
  const statusMap: Record<string, number> = {
    // Better Auth error codes - Unauthorized (401)
    INVALID_EMAIL_OR_PASSWORD: 401,
    INVALID_CREDENTIALS: 401,
    INVALID_PASSWORD: 401,
    UNAUTHORIZED: 401,

    // Not Found (404)
    USER_NOT_FOUND: 404,

    // Conflict (409)
    EMAIL_ALREADY_EXISTS: 409,
    CONFLICT: 409,

    // Forbidden (403)
    EMAIL_NOT_VERIFIED: 403,
    USER_SUSPENDED: 403,
    FORBIDDEN: 403,

    // Bad Request (400)
    BAD_REQUEST: 400,
    INVALID_EMAIL: 400,
    PASSWORD_TOO_WEAK: 400,
    INVALID_INPUT: 400,
    VALIDATION_FAILED: 400,

    // Too Many Requests (429)
    RATE_LIMIT_EXCEEDED: 429,
    TOO_MANY_REQUESTS: 429,

    // Server Error (500)
    INTERNAL_SERVER_ERROR: 500,
  };

  return statusMap[errorCode] || 400;
}

/**
 * Convert HTTP status code ke APIError status string
 */
function getErrorAPIStatus(
  statusCode: number,
):
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR' {
  const statusMap: Record<
    number,
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'TOO_MANY_REQUESTS'
    | 'INTERNAL_SERVER_ERROR'
  > = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
  };

  return statusMap[statusCode] || 'BAD_REQUEST';
}
