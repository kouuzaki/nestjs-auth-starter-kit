import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '@db/index';
import { config } from '@/config/loader';
import { emailOTP, lastLoginMethod, openAPI } from 'better-auth/plugins';
import { MailService } from '@/common/services/mail.service';

// Create mail service instance
const mailService = new MailService();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  account: {
    updateAccountOnSignIn: true,
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      allowUnlinkingAll: true,
    },
    encryptOAuthTokens: true,
    status: {
      enum: ['active', 'inactive', 'suspended'],
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
  ],
});
