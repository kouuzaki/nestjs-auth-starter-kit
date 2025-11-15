import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnvSchema = z.object({
  APP_PORT: z.coerce.number().int().min(1).default(3000),
  APP_GLOBAL_PREFIX: z.string().min(1).max(100).default('api'),
  APP_APPLICATION_NAME: z
    .string()
    .min(2)
    .max(100)
    .default('NestJS Auth Starter Kit'),

  APP_FRONTEND_URL: z.preprocess(
    (val): unknown => {
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val) as unknown;

          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item: unknown): item is string => typeof item === 'string',
            )
          ) {
            return parsed;
          }

          if (typeof parsed === 'string') {
            return [parsed];
          }
        } catch {
          return val.split(',').map((s) => s.trim());
        }
      }
      return val;
    },
    z.array(z.url()).default(['http://localhost:5173']),
  ),

  DATABASE_HOST: z.string().min(2).max(100),
  DATABASE_PORT: z.coerce.number().int().min(1).default(5432),
  DATABASE_USER: z.string().min(2).max(100),
  DATABASE_PASSWORD: z.string().min(2).max(100).optional(),
  DATABASE_NAME: z.string().min(2).max(100),

  BETTER_AUTH_SECRET: z.string().min(2).max(100),
  BETTER_AUTH_URL: z.string().url(),

  MAIL_HOST: z.string().min(2).max(100),
  MAIL_PORT: z.coerce.number().int().min(1).default(587),
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string().min(2).max(100),
  MAIL_FROM: z.string().email(),
  MAIL_FROM_NAME: z.string().min(2).max(100).default('NestJS Auth'),
});

export class AppEnvDto extends createZodDto(EnvSchema) {}
