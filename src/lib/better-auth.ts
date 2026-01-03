import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  emailOTP,
  lastLoginMethod,
  openAPI,
  twoFactor,
} from 'better-auth/plugins';
import { config } from '@/config/loader';
import { MailService } from '@/common/services/mail.service';
import { authResponseHook } from '@/modules/auth/hooks/auth-hooks';
import { DatabaseService } from '@/common/db';

/**
 * Get or create Better Auth instance
 * The drizzle adapter is lazy-loaded, so we can create this without DB being fully connected
 */
export function createBetterAuth(
  databaseService: DatabaseService,
  mailService: MailService,
) {
  const auth = betterAuth({
    appName: config.appName,
    database: drizzleAdapter(databaseService.db, {
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

  return auth;
}

// Export the auth type for use in other services
export type BetterAuthType = ReturnType<typeof createBetterAuth>;



