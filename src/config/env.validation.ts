// Load environment variables from .env files BEFORE validation
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

import { EnvSchema } from './env.dto';

export function validate(config: Record<string, unknown>) {
  try {
    return EnvSchema.parse(config);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Environment validation failed: ${error.message}`);
    }
    throw new Error('Environment validation failed');
  }
}

// Validate process.env at module load and export a typed instance.
export const AppEnv = validate(process.env);
