# Testing Guide - Better Auth Authentication

## Prerequisites

1. **Setup Email Provider** - Ikuti panduan di `EMAIL_SETUP.md`
2. **Database Running** - PostgreSQL harus running
3. **Environment Variables** - Semua env vars harus terisi

## Testing dengan Postman/Thunder Client

### 1. Test Sign Up

**Request:**

```http
POST http://localhost:3000/api/auth/sign-up/email
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User"
}
```

**Expected Result:**

- ✅ Status: 201 Created
- ✅ User created dengan `emailVerified: false`
- ✅ Email verification dikirim ke `test@example.com`
- ✅ Check email inbox (atau Mailtrap) untuk OTP/link

---

### 2. Test Email Verification dengan OTP

**Step 1: Check Email**

- Buka email yang dikirim
- Copy 6-digit OTP (contoh: `123456`)

**Step 2: Verify OTP**

**Request:**

```http
POST http://localhost:3000/api/auth/otp/verify
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456",
  "type": "email-verification"
}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ Response: `{ "success": true, "user": { "emailVerified": true } }`

---

### 3. Test Sign In (Email Belum Verified)

**Request:**

```http
POST http://localhost:3000/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Result (jika belum verify email):**

- ❌ Status: 403 Forbidden
- ❌ Error: "Email not verified"

---

### 4. Test Sign In (Email Sudah Verified)

**Request:**

```http
POST http://localhost:3000/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ Response berisi `session` token
- ✅ Cookie `better-auth.session_token` di-set

**Sample Response:**

```json
{
  "user": {
    "id": "clx123...",
    "email": "test@example.com",
    "name": "Test User",
    "emailVerified": true
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2025-01-15T00:00:00.000Z"
  }
}
```

---

### 5. Test Resend Verification Email

**Request:**

```http
POST http://localhost:3000/api/auth/send-verification-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ New verification email sent
- ✅ Check inbox untuk email baru

---

### 6. Test Forgot Password

**Step 1: Request Password Reset**

**Request:**

```http
POST http://localhost:3000/api/auth/forget-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ OTP dikirim ke email

**Step 2: Check Email dan Copy OTP**

**Step 3: Reset Password**

**Request:**

```http
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "654321",
  "newPassword": "NewSecurePass123!"
}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ Password berhasil direset

---

### 7. Test Get Current Session

**Request:**

```http
GET http://localhost:3000/api/auth/session
Authorization: Bearer {session_token_from_sign_in}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ Return user data dan session info

---

### 8. Test Sign Out

**Request:**

```http
POST http://localhost:3000/api/auth/sign-out
Authorization: Bearer {session_token}
```

**Expected Result:**

- ✅ Status: 200 OK
- ✅ Session invalidated
- ✅ Cookie cleared

---

## Testing dengan cURL

### Complete Flow Test

```bash
# 1. Sign Up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'

# 2. Check email untuk OTP, lalu verify
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","type":"email-verification"}'

# 3. Sign In
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# 4. Get Session (ganti {token} dengan token dari step 3)
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer {token}"

# 5. Sign Out
curl -X POST http://localhost:3000/api/auth/sign-out \
  -H "Authorization: Bearer {token}"
```

---

## Debugging Checklist

### Email Tidak Terkirim?

1. ✅ Check console logs untuk error
2. ✅ Verify MAIL\_\* environment variables
3. ✅ Test SMTP credentials dengan tool seperti:
   ```bash
   telnet smtp.gmail.com 587
   ```
4. ✅ Check spam folder
5. ✅ Gunakan Mailtrap untuk testing

### Sign In Gagal?

1. ✅ Pastikan email sudah verified
2. ✅ Check password benar
3. ✅ Check database: `SELECT * FROM user WHERE email = 'test@example.com'`
4. ✅ Lihat column `emailVerified` harus `true`

### OTP Invalid?

1. ✅ OTP expire setelah 10 menit
2. ✅ Request OTP baru jika sudah expire
3. ✅ Pastikan type OTP benar (email-verification, sign-in, forget-password)

---

## Database Verification

Cek data di PostgreSQL:

```sql
-- Check users
SELECT id, email, name, "emailVerified", "createdAt"
FROM "user"
ORDER BY "createdAt" DESC;

-- Check sessions
SELECT *
FROM "session"
WHERE "userId" = 'user_id_here';

-- Check verification tokens
SELECT *
FROM "verification"
WHERE identifier = 'test@example.com'
ORDER BY "expiresAt" DESC;
```

---

## Expected Email Templates

### 1. Verification Email (dengan OTP)

**Subject:** `Verify Your Email Address`

**Body:**

- Header dengan logo/branding
- OTP code (6 digits)
- Expiry notice (10 menit)
- Security warning

### 2. Sign In OTP Email

**Subject:** `Your Sign In OTP Code`

**Body:**

- OTP untuk sign in
- Security notice
- Link untuk report jika bukan Anda

### 3. Password Reset Email

**Subject:** `Reset Your Password`

**Body:**

- OTP untuk reset password
- Instructions
- Expiry time

---

## Common Issues & Solutions

### Issue: "Module not found: @/..."

**Solution:**

```bash
# Clear dist folder
rm -rf dist

# Rebuild
pnpm build
```

### Issue: "Database connection failed"

**Solution:**

1. Check PostgreSQL running: `pg_isready`
2. Check DATABASE\_\* env vars
3. Test connection:

```bash
psql -h localhost -U postgres -d nest_starter_kit
```

### Issue: "reflect-metadata error"

**Solution:**
Already added in `env.validation.ts`, restart app.

---

## Success Criteria

✅ User dapat sign up dengan email & password  
✅ Email verification otomatis terkirim  
✅ OTP dapat di-verify  
✅ User tidak bisa login sebelum verify email  
✅ Setelah verify, user bisa login  
✅ Session management working  
✅ Forgot password flow working  
✅ Email templates tampil dengan baik

---

## Next Steps

1. **Customize Email Templates** di `mail.service.ts`
2. **Add Rate Limiting** untuk prevent spam
3. **Setup CORS** untuk production
4. **Add Frontend Integration**
5. **Implement Refresh Tokens**
6. **Add Social Auth** (Google, GitHub, etc)
