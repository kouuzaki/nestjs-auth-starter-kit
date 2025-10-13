import { pgEnum } from 'drizzle-orm/pg-core';

export const accountStatusEnum = pgEnum('account_status', [
  'active',
  'inactive',
  'suspended',
]);
