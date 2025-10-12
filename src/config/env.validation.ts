// Load environment variables from .env files BEFORE validation
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvDto } from './env.dto';

export function validate(config: Record<string, unknown>): EnvDto {
  const validatedConfig = plainToInstance(EnvDto, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

// Validate process.env at module load and export a typed EnvDto instance.
export const AppEnv: EnvDto = validate(process.env);
