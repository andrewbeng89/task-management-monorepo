## 1. Choose and install tooling

- [x] 1.1 Verify whether `prisma-dbml-generator` runs against Prisma 7 (spike) — runs, BUT ignores column-level `@map` (emits `developerId` not `developer_id`), so unfit for a true DB representation
- [x] 1.2 Chosen fallback (design Decision 1b): uninstalled `prisma-dbml-generator`; installed `@dbml/core` (used in-memory instead of `@dbml/cli` to avoid an intermediate `.sql` file)
- [x] 1.3 Record the chosen approach (primary vs fallback) in the change/design notes — see design.md "Implementation Note"

## 2. Configure generation

- [x] 2.1 Primary path evaluated and rejected — `generator dbml` block removed from `schema.prisma`
- [x] 2.2 Fallback path implemented via `prisma/generate-dbml.ts`: `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` → `@dbml/core` `importer.import(sql, 'postgres')`
- [x] 2.3 Ensure the output directory `backend/prisma/dbml/` exists and is written to deterministically

## 3. Wire up the npm script

- [x] 3.1 Add `"db:dbml"` script to `backend/package.json` (`tsx prisma/generate-dbml.ts`)
- [x] 3.2 Confirm the script runs offline (no database connection required; verified against an unreachable DB host)

## 4. Generate and verify output

- [x] 4.1 Run `npm run db:dbml` and produce `backend/prisma/dbml/schema.dbml`
- [x] 4.2 Verify the DBML contains tables for `developers`, `skills`, `developer_skills`, `task_skills`, `tasks`
- [x] 4.3 Verify the `TaskStatus` enum (`TODO`, `IN_PROGRESS`, `DONE`) is present
- [x] 4.4 Verify relationships are captured, including M2M join tables and the self-referencing `Task` parent/child relation — with real column names (`developer_id`, `assignee_id`, `parent_id`, …) and FK delete rules
- [x] 4.5 Run the script twice and confirm the output is stable (no spurious diff)
- [ ] 4.6 Optionally sanity-check by importing the DBML into dbdiagram.io — optional/manual, left to the user

## 5. Documentation and commit

- [x] 5.1 Document the script name, how to run it, and the output location (backend/README.md)
- [ ] 5.2 Commit the generated `schema.dbml` so the ER diagram source is versioned — file is in place and not gitignored; commit deferred to the user
- [x] 5.3 Decide whether to keep or delete any intermediate `.sql` artifact — none created; `@dbml/core` converts the DDL in-memory, so only `schema.dbml` is written
