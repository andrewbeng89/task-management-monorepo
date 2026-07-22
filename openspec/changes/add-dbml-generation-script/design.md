## Context

The backend (`backend/`) uses Prisma 7 (`prisma` / `@prisma/client` `^7.9.0`) with a PostgreSQL datasource. The data model lives in `prisma/schema.prisma` (models `Developer`, `Skill`, `DeveloperSkill`, `TaskSkill`, `Task`; enum `TaskStatus`; several relations including a self-referencing `Task` tree and two explicit M2M join tables).

Prisma 7 moved the datasource `url` out of the schema and into `prisma.config.ts`, and the CLI no longer auto-loads `.env`. This matters because any DBML tooling must not depend on a live `DATABASE_URL`/database connection to run — generation should work purely from the schema definition.

The goal is a single npm script in `backend/package.json` that outputs a committed DBML file suitable for rendering an ER diagram (e.g. on dbdiagram.io).

## Goals / Non-Goals

**Goals:**
- One command (`npm run db:dbml`) that regenerates the DBML file deterministically.
- Output covers all models, enums, relations, and join tables.
- Works offline (no database connection required).
- Compatible with Prisma 7 tooling already in the project.

**Non-Goals:**
- Auto-rendering the diagram or publishing to dbdiagram.io.
- Wiring generation into CI or a pre-commit hook (can be a follow-up).
- Round-tripping DBML back into Prisma.

## Decisions

### Decision 1: How to convert the Prisma schema to DBML

**Chosen (primary): `prisma-dbml-generator` as a Prisma generator block**, invoked via `prisma generate`.

Add to `schema.prisma`:
```prisma
generator dbml {
  provider = "prisma-dbml-generator"
  output   = "./dbml"
  outputName = "schema.dbml"
}
```
Script: `"db:dbml": "prisma generate"` (or a dedicated invocation). This is the most idiomatic, least-code option and produces clean DBML with relations and enums directly from the datamodel.

**Risk / gate:** `prisma-dbml-generator` depends on Prisma's generator SDK, which changed in Prisma 7. During implementation we MUST verify it runs against `prisma@7`. If it fails or is unmaintained for v7, fall back to Decision 1b.

**Fallback (1b): `prisma migrate diff` → `@dbml/cli sql2dbml`.**
```
prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/dbml/schema.sql
sql2dbml prisma/dbml/schema.sql --postgres -o prisma/dbml/schema.dbml
```
`migrate diff --from-empty --script` derives DDL from the schema with no database connection, and `@dbml/cli`'s `sql2dbml` converts the DDL to DBML. This is fully version-resilient (relies only on first-party Prisma CLI output + the stable `@dbml` toolchain) at the cost of an intermediate SQL file and slightly less semantic relation naming.

**Alternatives considered:**
- Custom script using `@prisma/internals` `getDMMF()` + hand-rolled DBML writer — most control but most code to maintain; rejected unless both options above fail.
- `@dbml/core` importer directly on the Prisma file — its Prisma importer support is less mature than the SQL path; rejected in favor of the SQL fallback.

### Decision 2: Output location and naming

Output to `backend/prisma/dbml/schema.dbml`. Keeping it under `prisma/` co-locates it with the schema it mirrors. The `dbml/` folder is committed so the diagram source is versioned alongside the model.

### Decision 3: Script name

Use `db:dbml` to match the existing `db:seed` / `prisma:*` naming convention in `package.json`.

## Risks / Trade-offs

- **`prisma-dbml-generator` may not support Prisma 7** → Mitigation: verify early during implementation; fall back to the `migrate diff` + `sql2dbml` pipeline (Decision 1b) if incompatible.
- **Generated file drifts from schema if not regenerated** → Mitigation: document the command; a future task can add a CI check that regeneration produces no diff.
- **Fallback intermediate SQL file clutter** → Mitigation: keep the `.sql` as a byproduct or delete it after conversion within the script; decide during implementation.
- **`migrate diff` relation semantics** → the SQL-based fallback names relations from FK constraints rather than Prisma relation names, which is acceptable for an ER overview.

## Migration Plan

Additive, tooling-only change — no runtime or database migration. Deploy by merging the new devDependency, script, and generated file. Rollback = revert the commit; nothing depends on the DBML output at runtime.

## Open Questions

- None blocking. The primary-vs-fallback tool choice is resolved at implementation time by the Prisma 7 compatibility check described in Decision 1.

## Implementation Note (resolved)

The Prisma 7 compatibility spike (Decision 1) confirmed `prisma-dbml-generator` *runs*
under `prisma@7.9.0`, but its output is **incorrect for our goal**: it emits Prisma *field*
names (e.g. `developerId`) and ignores column-level `@map`, so the diagram would not show
the true database columns (`developer_id`, `assignee_id`, `created_at`, …). This is a
hard limitation of the generator ([table.js] always uses `field.name`, never the mapped
column name), not a schema bug — the `@map` declarations are correct.

**The fallback path (Decision 1b) was therefore chosen**, with one refinement: instead of
the `@dbml/cli` `sql2dbml` binary + an intermediate `.sql` file, generation runs through a
small `tsx` script (`prisma/generate-dbml.ts`, consistent with `db:seed`) that:

1. runs `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`
   (Prisma 7 renamed `--to-schema-datamodel` → `--to-schema`) to get the real Postgres DDL,
   which honors `@map`/`@@map`;
2. converts the DDL to DBML in-memory via `@dbml/core` `importer.import(sql, 'postgres')`;
3. writes only `prisma/dbml/schema.dbml` (no intermediate SQL artifact).

Verified: real column names, correct types, PKs, unique indexes, the `TaskStatus` enum,
M2M join tables, the self-referencing `Task` relation, and FK delete rules (cascade /
set null). Output is deterministic across runs and requires no database connection.
`prisma-dbml-generator` was uninstalled; `@dbml/core` is the sole added devDependency.
