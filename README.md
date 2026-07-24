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
| [`e2e/`](e2e/README.md)           | Playwright end-to-end browser tests that run against the containerized build.                    |
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

## System requirements

Everything below is what you need installed on the host to build, run, and test the app.

### Runtime & tooling

| Requirement        | Version                  | Notes                                                                                     |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| **Node.js**        | 20.19+ (or 22.12+), LTS  | Required by Vite 8; `nvm use --lts` recommended. No `engines` field is enforced.          |
| **npm**            | 9+ (ships with Node 20+) | Uses npm **workspaces**; run `npm install` once at the repo root to install all packages. |
| **Docker Engine**  | 20.10+                   | Runs PostgreSQL, and optionally the whole stack.                                          |
| **Docker Compose** | v2 (`docker compose`)    | The v2 plugin syntax; the repo's scripts assume it.                                       |
| **Git**            | any recent               | To clone the repo.                                                                        |

### External services

- **PostgreSQL 17** — provided as a container by Docker Compose (image `postgres:17-alpine`);
  no host-level Postgres install is required.
- **Gemini API** _(optional)_ — only for AI skill inference. Set `GEMINI_API_KEY` to enable it;
  the app runs identically without it. `GEMINI_MODEL` selects the model (defaults to
  `gemini-3.5-flash`); set it to a current model id if the default has been retired. See the
  AI notes under [Engineering decisions](#engineering--architectural-decisions).
  - **Fail-safe Design:** If `GEMINI_API_KEY` is missing, invalid, or quota-throttled, the backend
    automatically degrades gracefully (falling back to an empty skill list) so task creation **never fails or throws an HTTP 500 error**.

### Host ports

The stack binds these localhost ports — they must be free:

| Port   | Service               |
| ------ | --------------------- |
| `3000` | Frontend (nginx/Vite) |
| `6000` | Backend API           |
| `5432` | PostgreSQL            |

### End-to-end test dependencies

Running the Playwright suite additionally requires a downloaded browser:

```bash
npm run install:browsers --workspace=e2e   # one-time: downloads Chromium (+ OS deps)
```

See [`e2e/README.md`](e2e/README.md) for the full e2e prerequisites and flow.

## Local development setup

### Prerequisites

- Node.js 20.19+ (or 22.12+) and npm — see [System requirements](#system-requirements) above
- Docker + Docker Compose (for PostgreSQL, and optionally the whole stack)

### Install & configure

```bash
npm install                 # installs all workspaces
cp .env.example .env        # then edit values as needed
```

Key ports: **frontend** http://localhost:3000, **backend** http://localhost:6000
(API under `/api`), **PostgreSQL** `localhost:5432`.

Once running, the generated **OpenAPI 3.1 document** is served at `GET /api/openapi.json` —
load it into any OpenAPI viewer (Swagger UI, Scalar, Postman, etc.) to explore the endpoints.
Where to reach it depends on how you run the app:

- **Docker Compose (Option A):** the backend port `6000` is **not** meant to be used
  directly — the frontend fronts the API via the nginx `/api` proxy, so use
  [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json).
- **Workspaces directly (Option B):** hit the backend directly at
  [http://localhost:6000/api/openapi.json](http://localhost:6000/api/openapi.json).

### Option A — run everything with Docker Compose

```bash
npm run docker:up           # builds & starts postgres, backend, frontend
npm run docker:down         # stops the stack
```

> **Note on Docker startup:** container startup automatically applies Prisma database
> migrations (`prisma migrate deploy`) via the backend's entrypoint — no extra step is
> needed for the schema. Seeding is **not** automatic, though: to load the initial
> skills/developers, run the seed once after the stack is up (it's idempotent):
>
> ```bash
> docker compose exec backend npm run db:seed
> ```

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

## End-to-end tests

Browser-based end-to-end tests (Playwright) drive the app through a real browser
against the **containerized build**. Before running, they wait for the stack to be
ready and reset + seed the database to a known baseline. See
[`e2e/README.md`](e2e/README.md) for full detail (coverage, configuration, caveats).

```bash
npm install                                # installs the e2e workspace too
npm run install:browsers --workspace=e2e   # one-time: download Chromium

npm run e2e:up                             # build & start the containerized stack
npm run e2e:test                           # run the suite (waits for readiness, resets+seeds)
npm run e2e:down                           # stop the stack
```

> ⚠️ The reset step is **destructive** to the stack's database (`taskdb`) — it drops
> all task data and re-seeds the default skills and developers.

## Engineering / architectural decisions

> **Living document.** The notes below capture the rationale behind the current
> design at a high level and will be kept up to date with the MVP.

- **Monorepo with npm workspaces.** Backend and frontend live together for a single
  install, shared tooling (oxlint/Prettier), and coordinated changes, without a heavier
  monorepo tool.
- **Spec-driven development & documentation.** [OpenSpec](https://openspec.dev/) used for lightweight RFCs / Decision Logs;
  the latest specifications live in `/openspec/specs`, while iterative changes are logged to `/openspec/changes`.
- **Spec-driven API with generated OpenAPI.** Request/response shapes are Zod schemas;
  the OpenAPI 3.1 document is generated from those same schemas, so the published spec
  cannot drift from validation.
- **Prisma 7 with a driver adapter.** Modern ORM for easy querying, validation and type-checking. The datasource URL is provided via Prisma config
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
- **Consider open-weight, self-hosted models over a cloud provider.** Skill inference
  currently depends on a cloud-hosted provider (Gemini), which adds an external dependency,
  per-call cost, network latency, and sends task titles off-site. A future iteration should
  evaluate open-weight models (e.g. Qwen, Llama) served locally — this keeps data in-house,
  removes the API key and usage cost, and could be orchestrated as another Docker Compose
  service (e.g. an [Ollama](https://ollama.com/) / vLLM container) that the backend talks to
  over the internal network, keeping the existing best-effort, provider-swappable design.
- **Playwright for end-to-end tests.** Browser-level journeys are covered with
  [Playwright](https://playwright.dev/) (see [`e2e/`](e2e/README.md)) rather than Cypress.
  Playwright drives multiple browser engines from one API and runs tests as ordinary
  Node processes, which gives more flexibility (arbitrary `async`/`await` test code, easy
  reuse of the repo's existing Node/TypeScript tooling, straightforward `globalSetup` for
  DB reset + seed) and a noticeably lighter memory/resource footprint than Cypress's
  browser-runner architecture — a good fit for running against the containerized build
  locally and, later, in CI.

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
- **A task's required skills are set only at creation time.** Skills are chosen (or
  AI-inferred) when the task is created; updating the skills of an existing task is
  out of scope for the MVP. Consequently the task list shows the Skills cell as
  read-only, and there is no API endpoint for changing a task's skills — only its
  status and assignee are mutable after creation.
  - **Breaking changes to consider when an "edit skills" feature is added.** Assignment
    is coupled to skills: a developer may only be assigned to a task if they hold at
    least one of its required skills (see the skill-based assignment decision above).
    So editing a task's skills after assignment can invalidate an existing assignee —
    any future feature must decide how to handle that (e.g. block a skill change that
    would orphan the current assignee, or clear/re-validate the assignee on change) and
    will likely require API and data-integrity changes rather than a purely additive one.

## Known security advisories

- **`@prisma/dev` transitive advisories (dev-only) — resolved.** `npm audit` previously
  reported advisories chaining `prisma` → `@prisma/dev` → first `@hono/node-server`
  (path traversal / middleware bypass in `serveStatic`,
  [GHSA-frvp-7c67-39w9](https://github.com/advisories/GHSA-frvp-7c67-39w9),
  [GHSA-92pp-h63x-v22m](https://github.com/advisories/GHSA-92pp-h63x-v22m)), then
  `find-my-way` ≤ 9.6.0 (HTTP/2 DDoS,
  [GHSA-c96f-x56v-gq3h](https://github.com/advisories/GHSA-c96f-x56v-gq3h)). All are within
  the **development-only** Prisma CLI chain — the vulnerable code is not part of the
  production app runtime (the app serves via Express and uses `@prisma/client`), so impact
  on the deployed application was low.
- **Resolution:** a root-level [`overrides`](package.json) pins `find-my-way` to `^9.7.0`
  (the patched version). `overrides` must live in the **root** `package.json` to take effect
  across workspaces — placing it in `backend/package.json` has no effect. `npm audit` now
  reports **0 vulnerabilities**.
- If `npm audit` flags a similar transitive advisory in future, prefer adding/bumping a
  root `overrides` entry to a patched version over `npm audit fix` (which here pulled a
  newer `@prisma/dev` that introduced the `find-my-way` issue).
