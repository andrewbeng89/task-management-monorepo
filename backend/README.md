# Backend

Express + Prisma 7 (PostgreSQL) API for the task management app.

## Task API

REST endpoints for the task domain, described by an OpenAPI 3.1 document served at
`GET /api/openapi.json` (generated from the same Zod schemas used to validate requests, so
the spec never drifts from the implementation).

| Method & path                           | Description                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/tasks`                       | Create a task (`title` required; optional `status`, `requiredSkillIds`, `parentId`). Returns `201`.                                                                                         |
| `GET /api/tasks`                        | List all tasks (with assignee and required skills).                                                                                                                                         |
| `GET /api/tasks/:id`                    | Fetch a single task. `404` if unknown.                                                                                                                                                      |
| `PATCH /api/tasks/:id/assignee`         | Assign to a developer (`{ "developerId" }`). Allowed only if the developer has **at least one** of the task's required skills (any developer if the task requires none); `409` on mismatch. |
| `PATCH /api/tasks/:id/status`           | Update status (`{ "status": "TODO" \| "IN_PROGRESS" \| "DONE" }`).                                                                                                                          |
| `GET /api/developers/:id`               | Fetch a developer with its downstream relations: `id`, `name`, timestamps, and `skills`. Assigned tasks are excluded (upstream). `404` if unknown.                                          |
| `GET /api/skills/:id`                   | Fetch a skill's own fields: `id`, `name`, `createdAt`. Developers/tasks that reference it are excluded (upstream). `404` if unknown.                                                        |
| `GET /api/openapi.json`                 | The OpenAPI 3.1 specification.                                                                                                                                                              |
| `GET /api/health`, `GET /api/health/db` | Liveness / readiness.                                                                                                                                                                       |

Errors are JSON of shape `{ "error": string, "details"?: unknown }` with `4xx` for client
errors and `500` for unexpected failures.

### AI skill inference on task creation

When a task is created without `requiredSkillIds` (the field is omitted or empty), the
`createTask` service infers the task's required skills from **its own title** using the
Gemini API ([`@google/genai`](https://www.npmjs.com/package/@google/genai)), choosing only
from the skills that exist in the `skills` table. This applies to every created task,
including subtasks (each inferred from its own title). When `requiredSkillIds` is provided,
those skills are used as-is and no inference runs.

Inference is **best-effort**: it is controlled by `GEMINI_API_KEY` (and the optional
`GEMINI_MODEL`, default `gemini-3.5-flash`). If the key is unset, the skills table is empty,
or the Gemini call fails, the task is still created with no skills — inference never blocks
or fails task creation. Only the task title and the list of skill names are sent to Gemini.

> **Note — Gemini model deprecation / `404` errors.** Google rotates and retires Gemini
> model ids fairly often, and older ones become unavailable (especially to new API keys).
> If skill inference silently stops working, check the server logs for a Gemini `404`
> (e.g. _"This model … is no longer available to new users"_). This is not a bug — the
> best-effort fallback just creates the task with no skills. Fix it by setting `GEMINI_MODEL`
> to a currently-available model from the
> [Gemini models list](https://ai.google.dev/gemini-api/docs/models) (a `*-flash` model is
> the free-tier default). A `429` in the logs instead means the key has no free-tier quota,
> not a model problem.

### Running locally

```bash
docker compose up -d postgres   # start PostgreSQL
npm run prisma:migrate          # apply migrations (creates/updates tables)
npm run db:seed                 # seed default skills and developers
npm run dev                     # start the API (PORT defaults to 6000)
```

## Scripts

| Script                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Start the API in watch mode (`tsx`).                 |
| `npm run build`           | Compile TypeScript to `dist/`.                       |
| `npm start`               | Run the compiled server.                             |
| `npm run prisma:generate` | Generate the Prisma Client.                          |
| `npm run prisma:migrate`  | Run a development migration.                         |
| `npm run db:seed`         | Seed the database.                                   |
| `npm run db:dbml`         | Generate the DBML ER diagram from the Prisma schema. |

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
