import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '@db/index';
import { AppEnv } from '@/config/env.validation';
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
  baseURL: AppEnv.BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: AppEnv.BETTER_AUTH_SECRET,
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
