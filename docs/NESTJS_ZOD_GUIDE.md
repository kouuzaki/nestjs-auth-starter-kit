# NestJS Zod Integration Guide

This project uses `nestjs-zod` for validation, providing structured error responses and type-safe DTOs.

## Setup

### 1. Installation

Already installed in this project:

```bash
pnpm add nestjs-zod zod
```

### 2. Global Configuration

The application is configured in `src/app.module.ts`:

```typescript
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodValidationExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe, // Global validation pipe
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter, // Global exception filter
    },
  ],
})
export class AppModule {}
```

## Creating DTOs

### Basic DTO Example

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Define Zod schema
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

// Create DTO class
export class SignUpDto extends createZodDto(SignUpSchema) {}
```

### Using DTOs in Controllers

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { SignUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    // signUpDto is automatically validated
    // If validation fails, ZodValidationException is thrown
    return { message: 'Success', data: signUpDto };
  }
}
```

## Error Response Format

When validation fails, the response follows this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "path": "password",
      "message": "Password must be at least 8 characters",
      "code": "too_small"
    }
  ],
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/auth/sign-up"
}
```

## Available DTOs

Located in `src/common/dto/auth.dto.ts`:

### SignUpDto

```typescript
{
  email: string;      // Valid email format
  password: string;   // Min 8, max 100 characters
  name?: string;      // Optional, min 1 character if provided
}
```

### SignInDto

```typescript
{
  email: string; // Valid email format
  password: string; // Required, min 1 character
}
```

### VerifyOTPDto

```typescript
{
  email: string; // Valid email format
  otp: string; // Exactly 6 characters
  type: 'sign-in' | 'email-verification' | 'forget-password';
}
```

### SendOTPDto

```typescript
{
  email: string; // Valid email format
  type: 'sign-in' | 'email-verification' | 'forget-password';
}
```

### ForgetPasswordDto

```typescript
{
  email: string; // Valid email format
}
```

### ResetPasswordDto

```typescript
{
  email: string; // Valid email format
  otp: string; // Exactly 6 characters
  newPassword: string; // Min 8, max 100 characters
}
```

## Validation Rules

### Common Validations

```typescript
// Email
z.string().email('Invalid email format');

// Password
z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long');

// Enum
z.enum(['option1', 'option2', 'option3']);

// Optional field
z.string().optional();

// Required field with custom message
z.string().min(1, 'Field is required');

// Number with range
z.number().min(0).max(100);

// Array
z.array(z.string());

// Nested object
z.object({
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
});
```

## Custom Exception Filter

The `ZodValidationExceptionFilter` in `src/common/filters/global-exception.filter.ts` transforms Zod errors into a consistent format:

```typescript
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const zodError = exception.getZodError() as ZodError;

    // Transform to consistent error format
    const errorResponse = {
      statusCode: 400,
      message: 'Validation failed',
      errors: zodError.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(400).json(errorResponse);
  }
}
```

## Testing Validation

### Example Request (Success)

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Example Request (Validation Error)

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

Response:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "path": "password",
      "message": "Password must be at least 8 characters",
      "code": "too_small"
    }
  ],
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/auth/sign-up/email"
}
```

## Benefits

1. **Type Safety**: DTOs are fully typed with TypeScript
2. **Consistent Errors**: All validation errors follow the same format
3. **Better DX**: Schema definition is simple and readable
4. **Runtime Validation**: Validates data at runtime, not just compile time
5. **OpenAPI Support**: nestjs-zod can generate OpenAPI/Swagger docs
6. **No Decorators**: Cleaner code compared to class-validator

## Best Practices

1. **Define schemas separately** from DTOs for reusability
2. **Use meaningful error messages** in validation rules
3. **Keep validation logic in schemas**, not in business logic
4. **Test validation** with both valid and invalid data
5. **Document expected formats** in API documentation

## Resources

- [nestjs-zod Documentation](https://www.npmjs.com/package/nestjs-zod)
- [Zod Documentation](https://zod.dev/)
- [Better Auth Integration](./API_DOCUMENTATION.md)
