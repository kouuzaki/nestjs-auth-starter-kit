# Auth Response Formatting Guide

## Overview

System ini menyediakan custom API response formatting untuk Better Auth middleware, sesuai dengan standar di `ZodValidationExceptionFilter`.

## Struktur Response

Semua response dari auth endpoints akan memiliki format standar:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    /* response data */
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-in"
}
```

### Format Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-up"
}
```

## File Struktur

### 1. `src/common/utils/auth-response.ts`

Formatter utility untuk standardisasi response format. Berisi method-method static untuk berbagai tipe response.

**Methods:**

- `success()` - Format successful response
- `error()` - Format error response
- `validationError()` - Format validation error
- `unauthorized()` - Format unauthorized response (401)
- `forbidden()` - Format forbidden response (403)
- `notFound()` - Format not found response (404)
- `internalServerError()` - Format server error response (500)

### 2. `src/lib/auth-hooks.ts`

Hooks untuk Better Auth yang menggunakan `AuthResponseFormatter`.

**Hooks:**

- `authResponseHook` - After hook yang format response success dengan custom API response
- `authErrorHandlerHook` - Before hook untuk error handling (opsional, untuk future use)

### 3. `src/lib/auth.ts`

Configuration file yang sudah terintegrasi dengan `authResponseHook`.

## Usage

### Basic Usage - Success Response

```typescript
import { AuthResponseFormatter } from '@/common/utils/auth-response';

// Format success response
const response = AuthResponseFormatter.success(
  { userId: '123', email: 'user@example.com' },
  'User signed in successfully',
  HttpStatus.OK,
  '/api/auth/sign-in',
);
```

### Validation Error

```typescript
const response = AuthResponseFormatter.validationError(
  'Validation failed',
  [
    { path: 'email', message: 'Invalid email format', code: 'invalid_string' },
    { path: 'password', message: 'Password too weak', code: 'invalid_string' },
  ],
  '/api/auth/sign-up',
);
```

### Auth Error

```typescript
const response = AuthResponseFormatter.unauthorized(
  'Invalid credentials',
  '/api/auth/sign-in',
);
```

## Response Status Codes by Endpoint

| Endpoint           | Success Status | Method |
| ------------------ | -------------- | ------ |
| `/sign-up`         | 201 CREATED    | POST   |
| `/sign-in`         | 200 OK         | POST   |
| `/sign-out`        | 200 OK         | POST   |
| `/change-password` | 200 OK         | POST   |
| `/verify-email`    | 200 OK         | POST   |
| `/forget-password` | 200 OK         | POST   |
| `/reset-password`  | 200 OK         | POST   |

## How Hooks Work

### After Hook Flow

1. Request ke auth endpoint
2. Better Auth memproses request
3. `authResponseHook` dijalankan
4. Response di-format dengan `AuthResponseFormatter`
5. Format response dikembalikan ke client

### Automatic Message Generation

Hook secara otomatis menentukan message berdasarkan endpoint path:

```typescript
if (ctx.path.includes('/sign-up')) {
  message = 'User registered successfully';
  statusCode = HttpStatus.CREATED;
} else if (ctx.path.includes('/sign-in')) {
  message = 'User signed in successfully';
}
// ... dan seterusnya
```

## Extending the Formatter

Jika ingin menambah method formatter baru, tambahkan ke `AuthResponseFormatter`:

```typescript
static customResponse(
  statusCode: number,
  message: string,
  data?: any,
  path?: string
): ApiResponse {
  return {
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    path,
  };
}
```

## Error Response Handling

Hook ini juga menangani error responses dari Better Auth secara otomatis. Ketika ada error, response akan di-format dengan format standar:

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "errors": [
    {
      "code": "INVALID_EMAIL_OR_PASSWORD",
      "message": "Invalid email or password"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-in"
}
```

Lihat `docs/ERROR_RESPONSE_GUIDE.md` untuk detail lengkap tentang error handling.

## Extending the Hooks

Jika ingin menambah custom logic di hooks, edit `src/lib/auth-hooks.ts`:

```typescript
export const authResponseHook = createAuthMiddleware(async (ctx) => {
  // ... existing code

  // Handle success response
  if (/* cek success */) {
    // Custom logic sebelum return
    if (ctx.path.includes('/sign-up')) {
      // Send welcome email, log event, etc.
      await sendWelcomeEmail(returned.email);
    }

    return ctx.json(formattedResponse);
  }
});
```

## Error Handling

Error dari Better Auth akan di-handle dengan mapping status code:

- `BAD_REQUEST` → 400
- `UNAUTHORIZED` → 401
- `FORBIDDEN` → 403
- `NOT_FOUND` → 404
- `CONFLICT` → 409
- `INTERNAL_SERVER_ERROR` → 500
- `UNPROCESSABLE_ENTITY` → 422
- `TOO_MANY_REQUESTS` → 429

## Testing

Untuk test response format, Anda bisa menggunakan:

```typescript
describe('Auth Response Format', () => {
  it('should return formatted success response', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('path');
  });
});
```

## Notes

- Formatter ini digunakan secara otomatis di semua auth endpoints yang diprossess melalui `authResponseHook`
- Response timestamp menggunakan ISO 8601 format
- Path menunjukkan endpoint yang diakses
- Untuk non-POST requests, hook tidak memformat response untuk menghindari side effects
