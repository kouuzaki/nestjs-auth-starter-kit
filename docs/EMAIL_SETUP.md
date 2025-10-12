# Environment Setup Guide

## Email Configuration

Untuk menggunakan fitur email verification dan OTP, Anda perlu mengkonfigurasi SMTP server. Berikut adalah panduan untuk beberapa provider populer:

### 1. Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** di Google Account Anda
2. **Generate App Password**:
   - Buka https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan pilih device Anda
   - Copy password yang di-generate

3. **Update .env.development.local**:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=NestJS Auth
```

### 2. Mailtrap (Recommended for Testing)

Mailtrap adalah fake SMTP server yang sempurna untuk testing.

1. **Sign up** di https://mailtrap.io
2. **Create Inbox** dan copy credentials
3. **Update .env.development.local**:

```bash
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM=noreply@yourapp.com
MAIL_FROM_NAME=NestJS Auth
```

### 3. SendGrid (Recommended for Production)

1. **Sign up** di https://sendgrid.com
2. **Create API Key** dengan full access
3. **Update .env.development.local**:

```bash
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_FROM=verified-sender@yourdomain.com
MAIL_FROM_NAME=NestJS Auth
```

### 4. AWS SES

1. **Verify** email address atau domain di AWS SES
2. **Create SMTP credentials**
3. **Update .env.development.local**:

```bash
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
MAIL_USER=your-aws-smtp-username
MAIL_PASSWORD=your-aws-smtp-password
MAIL_FROM=verified@yourdomain.com
MAIL_FROM_NAME=NestJS Auth
```

### 5. Mailgun

1. **Sign up** di https://www.mailgun.com
2. **Verify** domain Anda
3. **Get SMTP credentials** dari dashboard
4. **Update .env.development.local**:

```bash
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=postmaster@your-domain.mailgun.org
MAIL_PASSWORD=your-mailgun-smtp-password
MAIL_FROM=noreply@yourdomain.com
MAIL_FROM_NAME=NestJS Auth
```

## Testing Email Locally

Untuk development, saya rekomendasikan menggunakan **Mailtrap** atau **Gmail dengan App Password**.

### Quick Start dengan Mailtrap:

1. Register di mailtrap.io (gratis)
2. Copy credentials dari inbox yang dibuat
3. Update .env.development.local
4. Test signup - email akan muncul di Mailtrap inbox

### Quick Start dengan Gmail:

1. Enable 2FA di Google Account
2. Generate App Password
3. Update .env.development.local dengan app password
4. Test signup - email akan dikirim ke email sungguhan

## API Endpoints

Better Auth sudah menyediakan endpoints berikut:

- `POST /api/auth/sign-up/email` - Register dengan email & password
- `POST /api/auth/sign-in/email` - Login dengan email & password
- `POST /api/auth/send-verification-email` - Kirim ulang email verifikasi
- `POST /api/auth/verify-email` - Verify email dengan token dari URL
- `GET /api/auth/verify-email?token=xxx` - Verify via link di email
- `POST /api/auth/otp/send` - Kirim OTP
- `POST /api/auth/otp/verify` - Verify OTP

## Flow Authentication

### Sign Up Flow:

1. User mengisi form sign up dengan email & password
2. System membuat user dengan `emailVerified: false`
3. System mengirim email verification otomatis dengan link/OTP
4. User klik link atau input OTP
5. Email ter-verify, user bisa login

### Sign In Flow:

1. User mengisi email & password
2. System cek credentials
3. System cek `emailVerified` status
4. Jika email belum verified, return error dan kirim email verification lagi
5. Jika sudah verified, return session token

## Environment Variables Checklist

Pastikan semua variable ini sudah diisi di `.env.development.local`:

```bash
# ✅ App
APP_PORT=3000

# ✅ Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=nest_starter_kit

# ✅ Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# ✅ Email (REQUIRED!)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=NestJS Auth
```

## Troubleshooting

### Error: "Invalid login credentials"

- Pastikan email sudah verified
- Cek password yang diinput benar

### Error: "Email not verified"

- Cek email untuk verification link
- Atau gunakan endpoint `POST /api/auth/send-verification-email` untuk kirim ulang

### Email tidak terkirim

- Cek MAIL\_\* environment variables
- Cek console log untuk error message
- Verify SMTP credentials benar
- Cek spam folder untuk email yang terkirim

### Gmail: "Username and Password not accepted"

- Pastikan sudah enable 2FA
- Gunakan App Password, bukan password Gmail biasa
- Pastikan App Password di-copy dengan benar (16 karakter tanpa spasi)
