# Task Management Monorepo

A small task-management application: create tasks (with optional required skills and
nested subtasks), assign them to developers whose skills match, and track status —
with a completion rule that a task can only be marked **Done** once all of its
subtasks are done. The frontend is an accessible, responsive React app; the backend
is a typed REST API with a generated OpenAPI document.

## Overview

This is an npm-workspaces monorepo:

| Path                              | What it is                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`backend/`](backend/README.md)   | Express + Prisma (PostgreSQL) REST API, validated with Zod and documented via OpenAPI.           |
| [`frontend/`](frontend/README.md) | React 19 + Vite single-page app (routing, task list, task creation).                             |
| [`openspec/`](openspec/)          | Spec-driven change history: capability specs under `specs/`, proposals/designs under `changes/`. |

See the per-package READMEs for endpoint-level and app-level detail.

## Tech stack

**Backend**

- Node.js + [Express](https://expressjs.com/) (TypeScript)
- [Prisma 7](https://www.prisma.io/) ORM with the `pg` driver adapter, on **PostgreSQL**
- [Zod](https://zod.dev/) for request validation
- OpenAPI 3.1 generated from the Zod schemas via [`@asteasolutions/zod-to-openapi`](https://github.com/asteasolutions/zod-to-openapi) (served at `GET /api/openapi.json`)
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Gemini) to infer a task's required skills from its title on creation when none are provided

**Frontend**

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [react-router-dom](https://reactrouter.com/) for routing
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [ky](https://github.com/sindresorhus/ky) HTTP client, [lucide-react](https://lucide.dev/) icons, [clsx](https://github.com/lukeed/clsx)

**Tooling**

- npm **workspaces** (`backend`, `frontend`)
- [oxlint](https://oxc.rs/) for linting, [Prettier](https://prettier.io/) for formatting
- [Docker Compose](https://docs.docker.com/compose/) for local orchestration (Postgres + backend + frontend)

## Local development setup

### Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose (for PostgreSQL, and optionally the whole stack)

### Install & configure

```bash
npm install                 # installs all workspaces
cp .env.example .env        # then edit values as needed
```

Key ports: **frontend** http://localhost:3000, **backend** http://localhost:6000
(API under `/api`), **PostgreSQL** `localhost:5432`.

### Option A — run everything with Docker Compose

```bash
npm run docker:up           # builds & starts postgres, backend, frontend
npm run docker:down         # stops the stack
```

### Option B — run the workspaces directly (Postgres in Docker)

```bash
docker compose up -d postgres        # start just the database

# backend (from ./backend)
npm run prisma:migrate               # apply migrations
npm run db:seed                      # seed default skills & developers
npm run dev:backend                  # (from repo root) start the API on :6000

# frontend
npm run dev:frontend                 # (from repo root) start Vite on :3000
```

> **Note:** `.env.example` sets `DATABASE_URL` with host `postgres` (the Docker network
> name). When running the **backend directly on your host** (Option B), point it at
> `localhost` instead, e.g. `postgresql://postgres:postgres@localhost:5432/taskdb?schema=public`.
> The frontend dev server proxies `/api` to the backend — see [`frontend/README.md`](frontend/README.md)
> for that detail and its own gotchas.

### Common scripts (repo root)

```bash
npm run build            # build all workspaces
npm run lint             # oxlint
npm run format           # prettier --write .
```

## Engineering / architectural decisions

> **Living document.** The notes below capture the rationale behind the current
> design at a high level and will be kept up to date with the MVP.

- **Monorepo with npm workspaces.** Backend and frontend live together for a single
  install, shared tooling (oxlint/Prettier), and coordinated changes, without a heavier
  monorepo tool.
- **Spec-driven API with generated OpenAPI.** Request/response shapes are Zod schemas;
  the OpenAPI 3.1 document is generated from those same schemas, so the published spec
  cannot drift from validation.
- **Prisma 7 with a driver adapter.** The datasource URL is provided via Prisma config
  (`prisma.config.ts`) + environment rather than hard-coded in `schema.prisma`; the
  database is managed by Prisma Migrate.
- **Skill-based assignment.** A developer may be assigned to a task only if they hold at
  least one of the task's required skills (any developer when a task requires none); the
  candidate list is exposed via `GET /api/tasks/:id/assignees`.
- **Recursive subtasks.** Tasks self-reference via `parentId`; a task exposes
  `allSubtasksDone` and can only transition to **Done** when all of its direct subtasks
  are done (enforced in the API and surfaced in the UI).
- **Accessibility-first frontend.** Semantic landmarks, keyboard operability, labelled
  controls, and announced updates are treated as requirements, not extras. The client
  uses `ky` directly (no server-state cache layer yet).
- **AI-assisted skill tagging.** When a task is created without skills, the backend infers
  them from the task's title via the Gemini API, constrained to existing skills. It is
  best-effort and behind `GEMINI_API_KEY`, so the app works identically with the key unset.

## Assumptions (MVP)

This is an MVP and intentionally leaves several things out of scope:

- **No authentication or login, and no user accounts.** Anyone with access to the app
  can view and modify all tasks; "developers" are seeded records, not authenticated users.
- **No authorization / roles.** There are no permissions or ownership checks.
- **Single-tenant.** All data belongs to one shared workspace.
- **No concurrent-edit conflict handling.** Simultaneous updates are effectively
  last-write-wins; there is no locking or optimistic-concurrency control.
- **Validation is limited to the API's Zod schemas**; there is no rate limiting.
- **No pagination** on list endpoints (fine at the expected MVP data volume).
