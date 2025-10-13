import { defineConfig } from 'drizzle-kit';
import { config } from './src/config/loader';

export default defineConfig({
  out: './migrations',
  schema: './src/common/db/*schema/**/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    ssl: false,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
  strict: true,
  verbose: true,
  breakpoints: true, // add breakpoint to SQL statements
});
