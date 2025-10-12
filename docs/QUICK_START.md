# Quick Start Commands

## 🚀 Setup Project

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.development.local

# Edit .env.development.local dengan credentials Anda
```

## 📧 Setup Email (Choose One)

### Option 1: Mailtrap (Recommended for Testing)

```bash
# 1. Sign up di https://mailtrap.io
# 2. Create inbox
# 3. Copy credentials ke .env.development.local:

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM=noreply@test.com
MAIL_FROM_NAME=NestJS Auth
```

### Option 2: Gmail (Real Emails)

```bash
# 1. Enable 2FA di Google Account
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Update .env.development.local:

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=NestJS Auth
```

## 🗄️ Setup Database

```bash
# Generate Better Auth schema
pnpm dlx @better-auth/cli generate --config ./auth.config.ts

# Generate Drizzle migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit migrate

# (Optional) Open Drizzle Studio untuk lihat database
pnpm drizzle-kit studio
```

## ▶️ Run Application

```bash
# Development mode (with watch)
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

## 🧪 Test Authentication

### Test dengan cURL

```bash
# 1. Sign Up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'

# 2. Check email inbox untuk OTP (6 digits)

# 3. Verify OTP
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","type":"email-verification"}'

# 4. Sign In
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# 5. Get Session (ganti {token} dengan token dari step 4)
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer {token}"
```

### Test Forgot Password

```bash
# 1. Request password reset
curl -X POST http://localhost:3000/api/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Check email untuk OTP

# 3. Reset password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"654321","newPassword":"NewPass123!"}'
```

## 📋 Database Commands

```bash
# Generate migrations from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio

# Drop database (⚠️ WARNING: deletes all data)
pnpm drizzle-kit drop
```

## 🔍 Useful PostgreSQL Commands

```bash
# Connect to database
psql -h localhost -U postgres -d nest_starter_kit

# Check users
SELECT id, email, name, "emailVerified", "createdAt" FROM "user";

# Check sessions
SELECT * FROM "session";

# Check verification tokens
SELECT * FROM "verification";

# Delete test user
DELETE FROM "user" WHERE email = 'test@example.com';
```

## 🛠️ Development Commands

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

## 📦 Build & Deploy

```bash
# Build for production
pnpm build

# Run production build
pnpm start:prod

# Build with SWC (faster)
pnpm build --builder swc
```

## 🐛 Troubleshooting

```bash
# Clear build cache
rm -rf dist

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset database
pnpm drizzle-kit drop
pnpm drizzle-kit migrate

# Check TypeScript errors
pnpm tsc --noEmit

# Check environment variables
node -e "require('dotenv').config({path:'.env.development.local'}); console.log(process.env)"
```

## 📚 Documentation

- **SETUP_SUMMARY.md** - Quick setup overview
- **EMAIL_SETUP.md** - Detailed email provider setup
- **API_DOCUMENTATION.md** - Complete API reference
- **TESTING_GUIDE.md** - Testing guide
- **.env.example** - Environment variables template

## 🎯 Quick Links

- Better Auth Docs: https://better-auth.com
- Drizzle ORM Docs: https://orm.drizzle.team
- NestJS Docs: https://docs.nestjs.com
- Nodemailer Docs: https://nodemailer.com

---

**Happy Coding! 🚀**
