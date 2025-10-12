import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  out: './drizzle',
  schema: './src/common/db/*schema/**/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME!,
  },
});
