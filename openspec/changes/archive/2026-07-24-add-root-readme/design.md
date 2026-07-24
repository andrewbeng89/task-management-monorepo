## Context

The monorepo uses npm workspaces (`backend`, `frontend`) with root scripts (`docker:up`, `dev:backend`, `dev:frontend`, `build`, `lint`, `format`). `docker-compose.yml` defines `postgres` (17-alpine, `5432`), `backend` (`6000`), and `frontend` (`3000:80`). The backend is Express + TypeScript + Prisma (PostgreSQL, driver adapter) + Zod with OpenAPI generated via `@asteasolutions/zod-to-openapi`, and depends on `@google/genai`. The frontend is React 19 + Vite + Tailwind CSS 4 + react-router-dom + ky. Per-package READMEs already exist. This change only adds a root `README.md`.

## Goals / Non-Goals

**Goals:**
- One authoritative entry-point README covering the required sections.
- Facts (commands, ports, stack) accurate to the current repo, so the setup steps actually work.
- An architectural-decisions section that is genuinely useful but clearly a **draft** for the author to refine.
- An honest MVP-assumptions section.

**Non-Goals:**
- No code, config, or dependency changes.
- Not duplicating the depth of the per-package READMEs — link to them.
- Not finalizing the architectural narrative (draft only).

## Decisions

### Source content from the repo, not assumptions
Derive the tech-stack list and setup commands from `package.json` (root + workspaces) and `docker-compose.yml`, so the README stays truthful. Prefer referencing existing scripts (`npm run docker:up`, `npm run dev:backend`, `npm run dev:frontend`, `db:seed`, `prisma:migrate`) over inventing new ones.

### Two documented ways to run locally
Document (a) the all-in-one Docker Compose path (`npm run docker:up`) and (b) running the workspaces directly against a Dockerized Postgres (start `postgres`, run migrate + seed, then the backend and frontend dev servers). Link to `frontend/README.md` (which already covers the dev-server/proxy detail) and `backend/README.md`.

### Architectural decisions as a labelled draft
Include a short bulleted draft of notable decisions (monorepo + npm workspaces; Prisma 7 driver adapter with config-provided datasource URL; spec-driven API with generated OpenAPI; skill-based assignment rule; recursive subtasks via self-relation with the "all subtasks done" completion rule; accessibility-first, `ky`-only frontend). Prefix the section with a clear "Draft — to be refined" note so the author can edit later without the content reading as final.

### MVP assumptions stated plainly
List the intentional simplifications: no auth/login or user accounts; no authorization/roles; single-tenant; no optimistic-concurrency handling for simultaneous edits (last-write-wins); minimal validation beyond the API's Zod schemas; no pagination. Keep it factual and short.

### Formatting
Standard GitHub-flavored Markdown: `#` title, `##` sections, fenced code blocks for commands, a small table for the tech stack. Keep it skimmable.

## Risks / Trade-offs

- **Docs drift from code over time** → mitigate by sourcing from `package.json`/compose now and linking to package READMEs rather than duplicating; future changes should update the README when commands change.
- **Draft decisions read as authoritative** → mitigate with an explicit draft banner on that section.

## Open Questions

- None blocking. The author will refine the architectural-decisions narrative after this lands.
