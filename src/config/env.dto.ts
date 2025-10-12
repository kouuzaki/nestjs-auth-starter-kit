import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Zod schema for the same environment variables
export const EnvSchema = z.object({
  APP_PORT: z.coerce.number().int().min(1).default(3000),
  DATABASE_HOST: z.string().min(2).max(100),
  DATABASE_PORT: z.coerce.number().int().min(1).default(5432),
  DATABASE_USER: z.string().min(2).max(100),
  DATABASE_PASSWORD: z.string().min(2).max(100).optional(),
  DATABASE_NAME: z.string().min(2).max(100),
  BETTER_AUTH_SECRET: z.string().min(2).max(100),
  BETTER_AUTH_URL: z.string().url(),

  // Email Configuration
  MAIL_HOST: z.string().min(2).max(100),
  MAIL_PORT: z.coerce.number().int().min(1).default(587),
  MAIL_USER: z.string().email(),
  MAIL_PASSWORD: z.string().min(2).max(100),
  MAIL_FROM: z.string().email(),
  MAIL_FROM_NAME: z.string().min(2).max(100).default('NestJS Auth'),
});

export const AppDtoEnv = createZodDto(EnvSchema);
