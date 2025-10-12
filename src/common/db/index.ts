import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { AppEnv } from '@/config/env.validation';

const pool = new Pool({
  database: AppEnv.DATABASE_NAME,
  user: AppEnv.DATABASE_USER,
  password: AppEnv.DATABASE_PASSWORD,
  host: AppEnv.DATABASE_HOST,
  port: AppEnv.DATABASE_PORT,
});

// Create a Drizzle client using the pg Pool
const db = drizzle(pool, { schema });

export default db;
