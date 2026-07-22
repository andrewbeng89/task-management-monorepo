# Backend

Express + Prisma 7 (PostgreSQL) API for the task management app.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode (`tsx`). |
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm start` | Run the compiled server. |
| `npm run prisma:generate` | Generate the Prisma Client. |
| `npm run prisma:migrate` | Run a development migration. |
| `npm run db:seed` | Seed the database. |
| `npm run db:dbml` | Generate the DBML ER diagram from the Prisma schema. |

## DBML entity-relationship diagram

`npm run db:dbml` (see [`prisma/generate-dbml.ts`](prisma/generate-dbml.ts)) writes a DBML
file to:

```
prisma/dbml/schema.dbml
```

How it works: `prisma migrate diff` renders the real Postgres DDL from
`prisma/schema.prisma` (honoring `@map` / `@@map`, so columns appear with their true
database names, e.g. `developer_id`), and `@dbml/core` converts that SQL to DBML. The DBML
therefore reflects the actual database structure — table names, column names, types,
primary keys, unique indexes, and foreign keys with their delete rules.

Generation reads the schema only — it does **not** connect to a database (a `DATABASE_URL`
value must still be present for Prisma config loading, e.g. via `.env`).

To view the diagram, paste the contents of `prisma/dbml/schema.dbml` into
[dbdiagram.io](https://dbdiagram.io). Regenerate and commit the file whenever the Prisma
schema changes.
