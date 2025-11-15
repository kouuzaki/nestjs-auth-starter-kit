# Error Response Formatting Guide

## Overview

Error responses dari Better Auth juga akan di-format menggunakan `AuthResponseFormatter` untuk konsistensi dengan response success.

## Format Error Response

Ketika ada error dari auth endpoint, response akan memiliki format:

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

## Common Error Codes

### Authentication Errors

| Code                        | HTTP Status | Message                   | Cause                            |
| --------------------------- | ----------- | ------------------------- | -------------------------------- |
| `INVALID_EMAIL_OR_PASSWORD` | 401         | Invalid email or password | Wrong credentials during sign-in |
| `INVALID_CREDENTIALS`       | 401         | Invalid credentials       | Wrong credentials                |
| `USER_NOT_FOUND`            | 404         | User not found            | Email tidak terdaftar            |
| `EMAIL_ALREADY_EXISTS`      | 409         | Email already exists      | Email sudah digunakan            |
| `UNAUTHORIZED`              | 401         | Unauthorized              | Tidak ada/invalid session/token  |

### Validation Errors

| Code                | HTTP Status | Message              | Cause                            |
| ------------------- | ----------- | -------------------- | -------------------------------- |
| `INVALID_EMAIL`     | 400         | Invalid email format | Format email salah               |
| `PASSWORD_TOO_WEAK` | 400         | Password too weak    | Password tidak memenuhi kriteria |
| `INVALID_INPUT`     | 400         | Invalid input        | Data input tidak valid           |
| `VALIDATION_FAILED` | 400         | Validation failed    | Validation error                 |

### Rate Limiting

| Code                | HTTP Status | Message           | Cause               |
| ------------------- | ----------- | ----------------- | ------------------- |
| `TOO_MANY_REQUESTS` | 429         | Too many requests | Rate limit exceeded |

### Server Errors

| Code                    | HTTP Status | Message               | Cause        |
| ----------------------- | ----------- | --------------------- | ------------ |
| `INTERNAL_SERVER_ERROR` | 500         | Internal server error | Server error |

## Error Response Examples

### Invalid Credentials

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "wrongpassword"
  }'
```

**Response (401):**

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

### Email Already Exists

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response (409):**

```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "errors": [
    {
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "Email already exists"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-up"
}
```

### Rate Limit Exceeded

**Response (429):**

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "errors": [
    {
      "code": "TOO_MANY_REQUESTS",
      "message": "Too many requests"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-in"
}
```

### Server Error

**Response (500):**

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "errors": [],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/sign-in"
}
```

## Error Handling Flow

```
Request to Auth Endpoint
    ↓
Better Auth Process Request
    ↓
Check for Error/Success
    ├─→ ERROR
    │   ↓
    │   Extract error code & message
    │   ↓
    │   Map to HTTP status code
    │   ↓
    │   Format with AuthResponseFormatter.error()
    │   ↓
    │   Return formatted error response
    │
    └─→ SUCCESS
        ↓
        Determine message & status based on path
        ↓
        Format with AuthResponseFormatter.success()
        ↓
        Return formatted response
```

## Status Code Mapping

Error codes dari Better Auth di-map ke HTTP status codes sebagai berikut:

| Error Code                | HTTP Status |
| ------------------------- | ----------- |
| INVALID_EMAIL_OR_PASSWORD | 401         |
| UNAUTHORIZED              | 401         |
| USER_NOT_FOUND            | 404         |
| EMAIL_ALREADY_EXISTS      | 409         |
| PASSWORD_TOO_WEAK         | 400         |
| INVALID_INPUT             | 400         |
| INVALID_EMAIL             | 400         |
| VALIDATION_FAILED         | 400         |
| TOO_MANY_REQUESTS         | 429         |
| INTERNAL_SERVER_ERROR     | 500         |
| (default)                 | 400         |

## Implementation Details

### authResponseHook

Hook ini berjalan setelah endpoint Better Auth dieksekusi dan:

1. **Mendeteksi Error**: Cek apakah `ctx.context.returned` berisi error
2. **Extract Details**: Ambil `code` dan `message` dari error object
3. **Map Status Code**: Convert error code ke HTTP status code
4. **Format Response**: Gunakan `AuthResponseFormatter.error()`
5. **Return**: Kembalikan response dengan format standar

```typescript
// Deteksi error
if (returned instanceof Error || returned?.error) {
  // Extract details
  const retObj = returned as Record<string, unknown> | null;
  const errorCode = retObj?.code;
  const errorMessage = retObj?.message;

  // Map status
  const statusCode = getStatusCodeFromAPIError(
    typeof errorCode === 'string' ? errorCode : 'BAD_REQUEST'
  );

  // Format & return
  return ctx.json(AuthResponseFormatter.error(...));
}
```

## Client-Side Handling

### TypeScript/JavaScript

```typescript
try {
  const response = await fetch('http://localhost:3000/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle error
    const errorCode = data.errors?.[0]?.code;
    const errorMessage = data.message;

    switch (errorCode) {
      case 'INVALID_EMAIL_OR_PASSWORD':
        console.error('Invalid credentials');
        break;
      case 'EMAIL_ALREADY_EXISTS':
        console.error('Email sudah terdaftar');
        break;
      default:
        console.error(errorMessage);
    }
  } else {
    // Handle success
    console.log(data.data);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Notes

- Error code berasal dari Better Auth library
- Message bisa di-customize melalui Better Auth configuration
- HTTP status code di-map secara otomatis berdasarkan error code
- Semua error response mencakup `errors` array untuk detail tambahan
- Timestamp dan path selalu disertakan untuk audit/logging
