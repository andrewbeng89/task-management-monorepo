# Backend

Express + Prisma 7 (PostgreSQL) API for the task management app.

## Task API

REST endpoints for the task domain, described by an OpenAPI 3.1 document served at
`GET /api/openapi.json` (generated from the same Zod schemas used to validate requests, so
the spec never drifts from the implementation).

| Method & path | Description |
| --- | --- |
| `POST /api/tasks` | Create a task (`title` required; optional `status`, `requiredSkillIds`, `parentId`). Returns `201`. |
| `GET /api/tasks` | List all tasks (with assignee and required skills). |
| `GET /api/tasks/:id` | Fetch a single task. `404` if unknown. |
| `PATCH /api/tasks/:id/assignee` | Assign to a developer (`{ "developerId" }`). Allowed only if the developer has **at least one** of the task's required skills (any developer if the task requires none); `409` on mismatch. |
| `PATCH /api/tasks/:id/status` | Update status (`{ "status": "TODO" \| "IN_PROGRESS" \| "DONE" }`). |
| `GET /api/developers/:id` | Fetch a developer with its downstream relations: `id`, `name`, timestamps, and `skills`. Assigned tasks are excluded (upstream). `404` if unknown. |
| `GET /api/skills/:id` | Fetch a skill's own fields: `id`, `name`, `createdAt`. Developers/tasks that reference it are excluded (upstream). `404` if unknown. |
| `GET /api/openapi.json` | The OpenAPI 3.1 specification. |
| `GET /api/health`, `GET /api/health/db` | Liveness / readiness. |

Errors are JSON of shape `{ "error": string, "details"?: unknown }` with `4xx` for client
errors and `500` for unexpected failures.

### Running locally

```bash
docker compose up -d postgres   # start PostgreSQL
npm run prisma:migrate          # or: npx prisma db push (create tables)
npm run db:seed                 # seed default skills and developers
npm run dev                     # start the API (PORT defaults to 6000)
```

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
