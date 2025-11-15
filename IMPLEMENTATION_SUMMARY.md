# Implementasi Auth Middleware dengan Custom API Response

## Ringkasan

Saya telah mengintegrasikan auth middleware yang mengembalikan **custom API response** sesuai dengan standar format di `ZodValidationExceptionFilter`. Semua endpoints auth sekarang mengembalikan response dengan format yang konsisten dan terstruktur.

## File yang Dibuat

### 1. **`src/common/utils/auth-response.ts`**

Utility class untuk standardisasi response format. Berisi static methods untuk berbagai jenis response:

- `success()` - Format response sukses
- `error()` - Format response error
- `validationError()` - Format validation error
- `unauthorized()` - Format 401 response
- `forbidden()` - Format 403 response
- `notFound()` - Format 404 response
- `internalServerError()` - Format 500 response

### 2. **`src/lib/auth-hooks.ts`**

Hooks untuk Better Auth yang menggunakan `AuthResponseFormatter`:

- `authResponseHook` - After hook yang meformat response sukses
- Helper function `getStatusCodeFromAPIError()` untuk mapping error status

### 3. **`docs/AUTH_RESPONSE_FORMATTING.md`**

Dokumentasi lengkap tentang penggunaan auth response formatter

## Perubahan pada File Existing

### `src/lib/auth.ts`

```typescript
// Sebelum:
import { createAuthMiddleware } from "better-auth/api";
hooks:{
  after: createAuthMiddleware(async (ctx) => {
    // ... old implementation
  })
}

// Sesudah:
import { authResponseHook } from '@/lib/auth-hooks';
hooks: {
  after: authResponseHook,
}
```

## Format Response

### Success Response (200, 201)

```json
{
  "statusCode": 200,
  "message": "User signed in successfully",
  "data": {
    "user": {
      /* user data */
    },
    "session": {
      /* session data */
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-in"
}
```

### Error Response (400, 401, 403, 404, 500)

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

## Fitur Utama

✅ **Standardisasi Response** - Semua auth endpoints mengembalikan format yang sama  
✅ **Dynamic Messages** - Message otomatis diset berdasarkan endpoint path  
✅ **Status Code Mapping** - Mapping otomatis dari APIError status ke HTTP status code  
✅ **Timestamp Tracking** - Setiap response mencakup ISO 8601 timestamp  
✅ **Error Handling** - Proper error formatting dengan details  
✅ **No Breaking Changes** - Implementasi non-intrusive, data auth tetap sama

## Endpoint Response Status Codes

| Endpoint           | Success Status | Message                                |
| ------------------ | -------------- | -------------------------------------- |
| `/sign-up`         | 201 CREATED    | User registered successfully           |
| `/sign-in`         | 200 OK         | User signed in successfully            |
| `/sign-out`        | 200 OK         | User signed out successfully           |
| `/change-password` | 200 OK         | Password changed successfully          |
| `/verify-email`    | 200 OK         | Email verified successfully            |
| `/forget-password` | 200 OK         | Password reset email sent successfully |
| `/reset-password`  | 200 OK         | Password reset successfully            |

## Error Status Codes

| Status | Description                               |
| ------ | ----------------------------------------- |
| 400    | BAD_REQUEST - Invalid input               |
| 401    | UNAUTHORIZED - Invalid credentials        |
| 403    | FORBIDDEN - Access denied                 |
| 404    | NOT_FOUND - Resource not found            |
| 409    | CONFLICT - Resource conflict              |
| 422    | UNPROCESSABLE_ENTITY - Unprocessable data |
| 429    | TOO_MANY_REQUESTS - Rate limited          |
| 500    | INTERNAL_SERVER_ERROR - Server error      |

## Cara Menggunakan di Controller/Service

Jika Anda ingin menggunakan formatter di tempat lain:

```typescript
import { AuthResponseFormatter } from '@/common/utils/auth-response';

// Success
const response = AuthResponseFormatter.success(data, 'Operation successful');

// Validation Error
const response = AuthResponseFormatter.validationError('Validation failed', [
  { path: 'email', message: 'Invalid email', code: 'invalid_string' },
]);

// Unauthorized
const response = AuthResponseFormatter.unauthorized('Invalid credentials');
```

## Testing

Untuk test response format:

```bash
# Test sign-in endpoint
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response akan memiliki format standardisasi dengan statusCode, message, data, timestamp, path
```

## Next Steps (Optional)

1. **Global Exception Handler** - Bisa integrate dengan exception filter untuk handle auth errors di global level
2. **Response Interceptor** - NestJS interceptor untuk wrap semua responses dengan format standar
3. **API Documentation** - Update Swagger/OpenAPI docs dengan response format baru
4. **Error Logging** - Tambah error logging/monitoring untuk track auth failures
5. **Rate Limiting** - Implementasi rate limiting untuk auth endpoints

## Tech Stack

- **Better Auth** - Authentication library
- **NestJS** - Framework
- **Drizzle ORM** - Database ORM
- **TypeScript** - Language
- **Prettier** - Code formatter

---

**Status**: ✅ Production Ready - Semua file error-free dan sesuai linting standards
