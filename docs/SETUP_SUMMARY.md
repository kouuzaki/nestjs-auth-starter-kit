# 📧 Setup Better Auth dengan Email Verification - Summary

## ✅ Apa yang Sudah Di-Setup

### 1. **Email Service** (`src/common/services/mail.service.ts`)

- ✅ Nodemailer integration
- ✅ Professional email templates (HTML)
- ✅ Support untuk OTP email (sign-in, verification, forgot password)
- ✅ Support untuk verification link email
- ✅ Responsive design dengan styling

### 2. **Better Auth Configuration** (`src/lib/auth.ts`)

- ✅ Email & password authentication
- ✅ Email verification required before login
- ✅ OTP plugin enabled
- ✅ Email verification otomatis saat sign up
- ✅ Integration dengan MailService

### 3. **Environment Variables** (`.env.development.local`)

- ✅ MAIL\_\* configuration untuk SMTP
- ✅ Support multiple providers (Gmail, Mailtrap, SendGrid, AWS SES, Mailgun)
- ✅ Validation dengan Zod schema

### 4. **Global Mail Module** (`src/common/services/mail.module.ts`)

- ✅ Global module untuk easy injection
- ✅ Exported MailService

## 🚀 Cara Menggunakan

### Step 1: Setup Email Provider

**Pilihan Termudah untuk Testing: Mailtrap**

1. Sign up di https://mailtrap.io (gratis)
2. Buat inbox baru
3. Copy SMTP credentials
4. Update `.env.development.local`:

```bash
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-username
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@test.com
MAIL_FROM_NAME=NestJS Auth
```

**Atau Gunakan Gmail:**

1. Enable 2-Factor Authentication
2. Generate App Password
3. Update `.env.development.local`:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=NestJS Auth
```

### Step 2: Generate Database Schema

```bash
# Generate Better Auth tables
pnpm dlx @better-auth/cli generate --config ./auth.config.ts

# Generate Drizzle migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit migrate
```

### Step 3: Start Application

```bash
pnpm start:dev
```

### Step 4: Test Authentication Flow

#### Test Sign Up dengan Postman/cURL:

```bash
# 1. Sign Up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'

# Response: User created, email verification sent
# Check email inbox (Mailtrap atau Gmail) untuk OTP
```

#### Verify Email dengan OTP:

```bash
# 2. Verify OTP (ganti 123456 dengan OTP dari email)
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "type": "email-verification"
  }'

# Response: Email verified successfully
```

#### Sign In:

```bash
# 3. Sign In
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Response: Session token + user data
```

## 📋 Available Endpoints

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| POST   | `/api/auth/sign-up/email`           | Register user baru        |
| POST   | `/api/auth/sign-in/email`           | Login user                |
| POST   | `/api/auth/send-verification-email` | Resend verification email |
| POST   | `/api/auth/verify-email`            | Verify dengan token       |
| POST   | `/api/auth/otp/send`                | Kirim OTP                 |
| POST   | `/api/auth/otp/verify`              | Verify OTP                |
| POST   | `/api/auth/forget-password`         | Request password reset    |
| POST   | `/api/auth/reset-password`          | Reset password dengan OTP |
| POST   | `/api/auth/sign-out`                | Logout                    |
| GET    | `/api/auth/session`                 | Get current session       |

## 🎯 Authentication Flow

### Sign Up Flow:

```
User fills form → User created (emailVerified: false)
→ Email sent dengan OTP → User verify OTP
→ emailVerified: true → User bisa login
```

### Sign In Flow:

```
User input credentials → Validate credentials
→ Check emailVerified → If false: error + resend email
→ If true: return session token
```

### Forgot Password Flow:

```
User request reset → OTP sent to email
→ User submit OTP + new password → Password reset
```

## 📧 Email Templates

3 jenis email yang otomatis terkirim:

1. **Verification Email** - Saat sign up
   - Subject: "Verify Your Email Address"
   - Contains: 6-digit OTP + expiry notice (10 min)

2. **Sign In OTP** - Saat login dengan OTP
   - Subject: "Your Sign In OTP Code"
   - Contains: 6-digit OTP

3. **Password Reset** - Saat forgot password
   - Subject: "Reset Your Password"
   - Contains: 6-digit OTP + instructions

**Customize templates di:** `src/common/services/mail.service.ts`

## 🔧 Customization

### Mengubah Email Templates:

Edit methods di `src/common/services/mail.service.ts`:

- `getOTPEmailTemplate()` - Template untuk OTP
- `getVerificationEmailTemplate()` - Template untuk verification link

### Mengubah OTP Settings:

Edit di `src/lib/auth.ts`:

```typescript
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    // Custom logic here
  },
  // Tambah options lain jika diperlukan
});
```

### Menambah Email Types:

Tambahkan case baru di `MailService`:

```typescript
if (type === 'custom-type') {
  // Send custom email
}
```

## 📚 Documentation Files

- **EMAIL_SETUP.md** - Detailed setup untuk berbagai email providers
- **API_DOCUMENTATION.md** - Complete API reference
- **TESTING_GUIDE.md** - Testing guide dengan examples
- **.env.example** - Template environment variables

## ⚠️ Important Notes

1. **Email harus diverify sebelum login** - Ini requirement dari Better Auth
2. **OTP expires dalam 10 menit** - Request baru jika sudah expire
3. **App Password untuk Gmail** - Jangan gunakan password biasa
4. **Mailtrap untuk testing** - Email tidak akan terkirim ke alamat sungguhan
5. **Production email provider** - Gunakan SendGrid/AWS SES untuk production

## 🐛 Troubleshooting

### Email tidak terkirim?

- ✅ Check console logs untuk error
- ✅ Verify MAIL\_\* env vars
- ✅ Test SMTP credentials
- ✅ Check spam folder

### Sign in failed?

- ✅ Pastikan email sudah verified
- ✅ Check password benar
- ✅ Lihat database: `SELECT * FROM "user" WHERE email = 'test@example.com'`

### OTP invalid?

- ✅ Check expiry time (10 menit)
- ✅ Request new OTP
- ✅ Verify type benar

## 🎉 Success Criteria

Jika semua bekerja dengan baik, Anda akan melihat:

1. ✅ User dapat sign up
2. ✅ Email verification otomatis terkirim
3. ✅ Email tampil di inbox (Mailtrap/Gmail)
4. ✅ OTP dapat di-verify
5. ✅ User tidak bisa login sebelum verify
6. ✅ Setelah verify, login berhasil
7. ✅ Session management working

## 📞 Support

Jika ada pertanyaan:

1. Check documentation files di root folder
2. Read Better Auth docs: https://better-auth.com
3. Open GitHub issue

---

**Setup Complete! 🎉**

Authentication dengan email verification sudah siap digunakan. Test dengan Postman atau cURL, dan customize sesuai kebutuhan Anda.
