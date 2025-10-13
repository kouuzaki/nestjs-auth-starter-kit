import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { config as appConfig } from '@/config/loader';

const pool = new Pool({
  database: appConfig.database.database,
  user: appConfig.database.user,
  password: appConfig.database.password,
  host: appConfig.database.host,
  port: appConfig.database.port,
});

// Create a Drizzle client using the pg Pool
const db = drizzle(pool, { schema });

export default db;
