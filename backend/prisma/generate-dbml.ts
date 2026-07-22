/**
 * Generates a DBML entity-relationship representation of the database from the
 * Prisma schema.
 *
 * Approach: `prisma migrate diff` renders the real Postgres DDL from the schema
 * (honoring `@map` / `@@map`, so columns appear with their true database names
 * like `developer_id`), then `@dbml/core` converts that SQL to DBML. This runs
 * offline — it never connects to a database.
 *
 * Output: prisma/dbml/schema.dbml
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { importer } from '@dbml/core';

const prismaDir = __dirname;
const schemaPath = path.join(prismaDir, 'schema.prisma');
const outDir = path.join(prismaDir, 'dbml');
const outFile = path.join(outDir, 'schema.dbml');

// 1. Derive the SQL DDL directly from the schema (no DB connection required).
const sql = execFileSync(
  'prisma',
  [
    'migrate',
    'diff',
    '--from-empty',
    '--to-schema',
    schemaPath,
    '--script',
  ],
  { encoding: 'utf8' },
);

// 2. Convert the Postgres DDL to DBML.
const dbml = importer.import(sql, 'postgres');

// 3. Write the diagram source.
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, dbml.trimEnd() + '\n');

console.log(`Generated DBML at ${path.relative(process.cwd(), outFile)}`);
