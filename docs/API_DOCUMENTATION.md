# Better Auth API Documentation

## Base URL

All endpoints are prefixed with `/api/auth`

## Authentication Endpoints

### 1. Sign Up with Email

**Endpoint:** `POST /api/auth/sign-up/email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe" // optional
}
```

**Success Response (201):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "session": null
}
```

**Notes:**

- Email verification akan dikirim otomatis
- User tidak bisa login sampai email verified
- Password minimal 8 karakter

---

### 2. Sign In with Email

**Endpoint:** `POST /api/auth/sign-in/email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2025-01-08T00:00:00.000Z"
  }
}
```

**Error Response (401) - Email Not Verified:**

```json
{
  "error": "Email not verified",
  "message": "Please verify your email before signing in"
}
```

---

### 3. Send Verification Email

**Endpoint:** `POST /api/auth/send-verification-email`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Use Cases:**

- Resend verification email
- User tidak menerima email pertama
- Email verification expired

---

### 4. Verify Email

**Option A - Via Email Link (GET):**

**Endpoint:** `GET /api/auth/verify-email?token=verification_token_here`

User klik link di email, otomatis redirect dan verify.

**Option B - Manual Verification (POST):**

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**

```json
{
  "token": "verification_token_from_email"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 5. Send OTP

**Endpoint:** `POST /api/auth/otp/send`

**Request Body:**

```json
{
  "email": "user@example.com",
  "type": "email-verification" // atau "sign-in" atau "forget-password"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Notes:**

- OTP valid selama 10 menit
- OTP adalah 6 digit angka

---

### 6. Verify OTP

**Endpoint:** `POST /api/auth/otp/verify`

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "email-verification"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

**Error Response (400):**

```json
{
  "error": "Invalid OTP",
  "message": "The OTP you entered is incorrect or expired"
}
```

---

### 7. Forget Password

**Step 1 - Request Password Reset:**

**Endpoint:** `POST /api/auth/forget-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

**Step 2 - Reset Password with OTP:**

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 8. Sign Out

**Endpoint:** `POST /api/auth/sign-out`

**Headers:**

```
Authorization: Bearer {session_token}
```

**Success Response (200):**

```json
{
  "success": true
}
```

---

### 9. Get Session

**Endpoint:** `GET /api/auth/session`

**Headers:**

```
Authorization: Bearer {session_token}
```

**Success Response (200):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2025-01-08T00:00:00.000Z"
  }
}
```

---

## Error Responses

All error responses follow a consistent format using nestjs-zod:

### Validation Error (400):

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

### Common Error Codes:

**400 Bad Request:**

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
  "path": "/api/auth/sign-in/email"
}
```

**401 Unauthorized:**

```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

**403 Forbidden:**

```json
{
  "error": "Forbidden",
  "message": "Email not verified"
}
```

**409 Conflict:**

```json
{
  "error": "Conflict",
  "message": "User already exists"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Complete Authentication Flow Examples

### Example 1: Sign Up + Email Verification Flow

```bash
# Step 1: Sign Up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# Response: User created, verification email sent
# User receives email with OTP: 123456

# Step 2: Verify Email with OTP
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "type": "email-verification"
  }'

# Response: Email verified successfully

# Step 3: Sign In
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Response: Returns session token
```

### Example 2: Forgot Password Flow

```bash
# Step 1: Request Password Reset
curl -X POST http://localhost:3000/api/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Response: OTP sent to email
# User receives OTP: 654321

# Step 2: Reset Password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "654321",
    "newPassword": "NewSecurePass123!"
  }'

# Response: Password reset successfully
```

---

## Notes

1. **Session Management**: Better Auth menggunakan cookie-based sessions secara default
2. **CORS**: Pastikan CORS configured untuk production
3. **Rate Limiting**: Implementasikan rate limiting untuk prevent abuse
4. **Email Templates**: Customize templates di `mail.service.ts`
5. **OTP Expiry**: Default 10 menit, bisa di-adjust di Better Auth config
