import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '@db/index';
import { config } from '@/config/loader';
import {
  emailOTP,
  lastLoginMethod,
  openAPI,
  twoFactor,
} from 'better-auth/plugins';
import { MailService } from '@/common/services/mail.service';
import { authResponseHook } from '@/lib/auth-hooks';

// Create mail service instance
const mailService = new MailService();

export const auth = betterAuth({
  appName: config.appName,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  trustedOrigins: config.getFrontendUrls(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await mailService.sendPasswordResetEmail(user.email, url, user.name);
    },
    onPasswordReset: async ({ user }) => {
      await mailService.sendPasswordChangeSuccessEmail(user.email, user.name);
    },
  },
  hooks: {
    before: authResponseHook,
    after: authResponseHook,
  },
  account: {
    updateAccountOnSignIn: true,
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      allowUnlinkingAll: true,
    },
    encryptOAuthTokens: true,
    additionalFields: {
      status: {
        type: 'string',
        returned: true,
        defaultValue: 'active',
      },
    },
    storeSessionInDatabase: true,
    preserveSessionInDatabase: false,
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  baseURL: config.betterAuth.url,
  basePath: '/api/auth',
  secret: config.betterAuth.secret,

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      await mailService.sendVerificationEmail(user.email, url, user.name);
    },
  },
  plugins: [
    lastLoginMethod(),
    openAPI(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await mailService.sendVerificationOTP(email, otp, type);
      },
    }),
    twoFactor({
      issuer: config.appName,
      skipVerificationOnEnable: true,
      otpOptions: {
        digits: 6,
        period: 30,
      },
    }),
  ],
});
