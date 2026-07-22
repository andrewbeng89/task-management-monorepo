import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 config. The datasource `url` used to live in schema.prisma but is now
// provided here (the CLI no longer auto-loads .env, hence `dotenv/config` above).
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    // Run after `prisma migrate dev` / `migrate reset` applies migrations.
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
