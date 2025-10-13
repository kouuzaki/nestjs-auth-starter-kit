# NestJS Auth Starter Kit

NestJS authentication starter kit dengan Better Auth, Drizzle ORM, PostgreSQL, dan email verification menggunakan OTP.

## ✨ Features

- 🔐 **Better Auth Integration** - Modern authentication dengan email & password
- ✉️ **Email Verification** - OTP-based email verification dengan nodemailer
- 📧 **HTML Email Templates** - Template email yang indah untuk OTP dan verifikasi
- 🗄️ **Drizzle ORM** - Type-safe database queries dengan PostgreSQL
- ✅ **nestjs-zod Validation** - Validasi terstruktur dengan Zod schemas
- 🔒 **Environment Validation** - Type-safe environment variables dengan Zod
- 🚀 **SWC Compiler** - Kompilasi cepat dan hot reload
- 📝 **TypeScript** - Full type safety di seluruh aplikasi
- 🎨 **Prettier & ESLint** - Code formatting dan linting

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Authentication**: Better Auth 1.3.27
- **Database**: PostgreSQL dengan Drizzle ORM
- **Validation**: nestjs-zod + Zod
- **Email**: Nodemailer
- **Compiler**: SWC
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SMTP server (Gmail, Mailtrap, dll.)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd nestjs-auth-starter-kit

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.development.local

# Edit .env.development.local dengan credentials kamu
# - Database credentials
# - SMTP settings
# - Better Auth secret

# Run database migrations
pnpm drizzle-kit push

# Start development server
pnpm start:dev
```

Server akan running di `http://localhost:3000`

## 📚 Documentation

- [Quick Start Guide](./docs/QUICK_START.md)
- [Setup Summary](./docs/SETUP_SUMMARY.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Email Setup Guide](./docs/EMAIL_SETUP.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)
- [NestJS Zod Guide](./docs/NESTJS_ZOD_GUIDE.md)

## 📁 Project Structure

```
src/
├── common/
│   ├── db/                    # Drizzle ORM setup & schemas
│   ├── dto/                   # Data Transfer Objects (Zod DTOs)
│   ├── filters/               # Exception filters (nestjs-zod)
│   ├── services/              # Shared services (mail, template)
│   └── examples/              # Example controllers
├── config/
│   ├── env.dto.ts            # Environment schema (Zod)
│   └── env.validation.ts     # Environment validation
├── lib/
│   └── auth.ts               # Better Auth configuration
├── modules/
│   └── user/                 # User module
├── templates/                # Email templates (HTML)
│   ├── otp-email.template.html
│   └── verification-email.template.html
└── main.ts                   # Application entry point
```

## ⚙️ Environment Variables

Buat file `.env.development.local`:

```env
# App
APP_PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=nest_starter_kit

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Mail (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@example.com
MAIL_FROM_NAME=NestJS Auth
```

## ✅ Validation dengan nestjs-zod

Project ini menggunakan `nestjs-zod` untuk validasi terstruktur:

```typescript
// Define schema
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Create DTO
export class SignUpDto extends createZodDto(SignUpSchema) {}

// Use in controller - validation otomatis
@Post('sign-up')
async signUp(@Body() signUpDto: SignUpDto) {
  // signUpDto sudah tervalidasi dan typed
}
```

### Format Error Response

Semua validation error akan mengikuti format ini:

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
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/auth/sign-up"
}
```

## 🔌 API Endpoints

Semua endpoints diawali dengan `/api/auth`:

- `POST /api/auth/sign-up/email` - Register user baru
- `POST /api/auth/sign-in/email` - Login user
- `POST /api/auth/otp/send` - Kirim OTP ke email
- `POST /api/auth/otp/verify` - Verifikasi OTP
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password dengan OTP
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Logout user

Lihat [API Documentation](./docs/API_DOCUMENTATION.md) untuk detail lengkap.

## 💻 Development

```bash
# Start development server
pnpm start:dev

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🗄️ Database Migrations

```bash
# Generate migration
pnpm drizzle-kit generate

# Push schema ke database
pnpm drizzle-kit push

# Buka Drizzle Studio (database GUI)
pnpm drizzle-kit studio
```

## 📧 Email Templates

Email templates terletak di `src/templates/`:

- `otp-email.template.html` - Email OTP dengan kode 6 digit
- `verification-email.template.html` - Email verifikasi dengan link

Templates menggunakan syntax `{{PLACEHOLDER}}`:

```html
<p>Your OTP code is: <strong>{{OTP}}</strong></p>
<p>This code will expire in 10 minutes.</p>
```

## 🎯 Authentication Flow

### Sign Up Flow

1. User sign up dengan email & password → `POST /api/auth/sign-up/email`
2. System kirim OTP ke email user
3. User verify email dengan OTP → `POST /api/auth/otp/verify`
4. Email terverifikasi, user bisa login

### Sign In Flow

1. User sign in dengan email & password → `POST /api/auth/sign-in/email`
2. Jika email belum verified, sign in akan gagal
3. Jika sudah verified, return session token

### Forget Password Flow

1. User request reset password → `POST /api/auth/forget-password`
2. System kirim OTP ke email
3. User reset password dengan OTP → `POST /api/auth/reset-password`

## 📖 Cara Pakai nestjs-zod

### 1. Setup Global (Sudah Dikonfigurasi)

Di `app.module.ts`:

```typescript
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodValidationExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe, // Global validation
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter, // Global error handler
    },
  ],
})
```

### 2. Buat DTO dengan Zod

Di `src/common/dto/auth.dto.ts`:

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Define schema
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().optional(),
});

// Create DTO class
export class SignUpDto extends createZodDto(SignUpSchema) {}
```

### 3. Gunakan di Controller

```typescript
@Post('sign-up')
async signUp(@Body() signUpDto: SignUpDto) {
  // Validation otomatis
  // Jika gagal, throw ZodValidationException
  // Error akan ditangkap oleh ZodValidationExceptionFilter
  return signUpDto;
}
```

### 4. Response Format

**Success:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Error:**

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
      "message": "Password minimal 8 karakter",
      "code": "too_small"
    }
  ],
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/auth/sign-up"
}
```

## 🧪 Testing

```bash
# Test validation dengan curl
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

Response akan menampilkan error validation yang terstruktur.

## 📝 License

UNLICENSED

---

Made with ❤️ using NestJS, Better Auth, Drizzle ORM, and nestjs-zod
