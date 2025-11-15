import { createAuthMiddleware, APIError } from 'better-auth/api';
import { AuthResponseFormatter } from '@/common/utils/auth-response';
import { HttpStatus } from '@nestjs/common';

/**
 * After hook untuk format response (success & error) dengan custom API response
 */
export const authResponseHook = createAuthMiddleware(async (ctx) => {
  // Hanya process POST requests
  if (ctx.request?.method !== 'POST') {
    return;
  }

  // Cek jika ada returned value dari endpoint
  if (ctx.context.returned) {
    const returned = ctx.context.returned as Record<string, unknown>;

    // Handle error response dari Better Auth
    if (returned instanceof Error || returned?.error) {
      // Extract error details from returned object
      const retObj = returned as Record<string, unknown> | null;
      const errorCode = retObj?.code;
      const errorMessage = retObj?.message;

      const statusCode = getStatusCodeFromAPIError(
        typeof errorCode === 'string' ? errorCode : 'BAD_REQUEST',
      );

      const formattedErrorResponse = AuthResponseFormatter.error(
        String(errorMessage) || 'An error occurred',
        statusCode,
        errorCode && typeof errorCode === 'string'
          ? [
              {
                code: errorCode,
                message: String(errorMessage) || 'An error occurred',
              },
            ]
          : undefined,
        ctx.path,
      );

      return ctx.json(formattedErrorResponse);
    }

    // Handle success response
    let message = 'Success';
    let statusCode = HttpStatus.OK;

    // Determine message dan status code berdasarkan path
    if (ctx.path.includes('/sign-up')) {
      message = 'User registered successfully';
      statusCode = HttpStatus.CREATED;
    } else if (ctx.path.includes('/sign-in')) {
      message = 'User signed in successfully';
    } else if (ctx.path.includes('/change-password')) {
      message = 'Password changed successfully';
    } else if (ctx.path.includes('/verify-email')) {
      message = 'Email verified successfully';
    } else if (ctx.path.includes('/forget-password')) {
      message = 'Password reset email sent successfully';
    } else if (ctx.path.includes('/reset-password')) {
      message = 'Password reset successfully';
    } else if (ctx.path.includes('/sign-out')) {
      message = 'User signed out successfully';
    }

    const formattedResponse = AuthResponseFormatter.success(
      returned,
      message,
      statusCode,
      ctx.path,
    );

    return ctx.json(formattedResponse);
  }
});

/**
 * Before hook untuk handle error dengan custom API response
 */
export const authErrorHandlerHook = createAuthMiddleware(async (ctx) => {
  try {
    // Middleware akan dijalankan sebelum endpoint
    // Error handling akan ditangani di after hook
  } catch (error) {
    if (error instanceof APIError) {
      const message = error.message || 'Authentication error';
      const statusCode = getStatusCodeFromAPIError(String(error.status));

      const formattedResponse = AuthResponseFormatter.error(
        message,
        statusCode,
        undefined,
        ctx.path,
      );

      return ctx.json(formattedResponse);
    }

    // Fallback untuk error lainnya
    const formattedResponse = AuthResponseFormatter.internalServerError(
      'An unexpected error occurred',
      ctx.path,
    );

    return ctx.json(formattedResponse);
  }
});

/**
 * Helper function untuk convert APIError status ke HTTP status code
 */
function getStatusCodeFromAPIError(status: string): number {
  const statusMap: Record<string, number> = {
    BAD_REQUEST: HttpStatus.BAD_REQUEST,
    UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
    FORBIDDEN: HttpStatus.FORBIDDEN,
    NOT_FOUND: HttpStatus.NOT_FOUND,
    CONFLICT: HttpStatus.CONFLICT,
    INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY: HttpStatus.UNPROCESSABLE_ENTITY,
    TOO_MANY_REQUESTS: HttpStatus.TOO_MANY_REQUESTS,
  };

  return statusMap[status] || HttpStatus.BAD_REQUEST;
}
