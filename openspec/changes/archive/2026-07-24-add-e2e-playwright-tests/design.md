## Context

The monorepo is an npm-workspaces project (`backend`, `frontend`) orchestrated for local/prod via Docker Compose (Postgres + backend + frontend). The frontend is a React SPA served on port 3000 (nginx in the container); the backend REST API is on 6000; Postgres is exposed on the host at 5432.

There is currently no browser-level test coverage. The backend already provides `db:reset` (`prisma migrate reset --force`) and `db:seed` (`tsx prisma/seed.ts`) scripts; the containerized backend applies migrations at startup via `docker-entrypoint.sh` (`prisma migrate deploy`) but does **not** seed. Seeding creates default skills (Frontend, Backend) and developers (Alice, Bob, Carol, Dave) and no tasks.

This change adds a small Playwright suite that exercises the core journeys from the `task-web-ui` spec against the containerized build, from a deterministic seeded baseline.

## Goals / Non-Goals

**Goals:**
- A minimal, reliable Playwright suite covering: view list (empty seeded state), create a single task, create a nested subtask tree, update status, assign a developer.
- Run against the **containerized** stack (Docker Compose), targeting the container-served frontend.
- Deterministic start state via a reset-and-seed fixture, with readiness waiting before tests.
- Single documented command flow and repo-level scripts.

**Non-Goals:**
- Exhaustive coverage of every scenario in `task-web-ui` (accessibility, error states, responsive breakpoints) — this is a *basic* suite.
- Testing Gemini skill inference (best-effort, key-gated) — tests will supply skills explicitly or assert titles/status only.
- CI pipeline wiring (documented flow only; CI adoption can follow).
- Cross-browser matrix — start with Chromium only.

## Decisions

### Test location: a dedicated `e2e/` workspace
Add `e2e/` as a third npm workspace containing `@playwright/test`, `playwright.config.ts`, and `tests/`. Keeps Playwright's dev dependency and browser binaries isolated from `frontend`/`backend`, and gives e2e its own scripts.
- *Alternative considered:* placing tests under `frontend/` — rejected because e2e spans frontend+backend+DB and shouldn't couple to the frontend build/test tooling.

### Target the containerized frontend, do not let Playwright spawn servers
`baseURL` = `http://localhost:3000` (the compose-served frontend). Orchestration (bring stack up, wait, seed, run, tear down) lives in repo-root npm scripts, not in Playwright's `webServer`. This makes "run against the containerized build" explicit and avoids Playwright starting dev servers that would bypass the container requirement.
- *Alternative considered:* Playwright `webServer` running `docker compose up` with `reuseExistingServer` — rejected as less transparent about the reset/seed ordering; readiness/seed sequencing is clearer as explicit steps.

### DB reset + seed via existing backend scripts against host-exposed Postgres
A Playwright `globalSetup` (or a wrapping npm script) runs the backend's reset+seed against Postgres on `localhost:5432`, using a `DATABASE_URL` override that points at `localhost` (the compose file publishes 5432). Concretely: `prisma migrate reset --force` (drops + re-migrates) followed by `db:seed`, or `db:reset` if seed is wired into Prisma's reset. This reuses proven scripts and reaches the same database the containerized backend uses.
- *Alternative considered:* `docker compose exec backend npm run db:reset` — rejected because the production backend image builds/prunes to runtime deps and may lack the Prisma CLI, `tsx`, and the seed script, so exec is unreliable.
- *Alternative considered:* seeding via API calls — rejected; skills/developers are seed data, and going through the API for baseline state is more brittle than the existing seed script.

### Readiness wait before tests
`globalSetup` polls the frontend base URL and a backend endpoint (e.g. `GET /api/openapi.json` or `/api/tasks`) until each responds, with a timeout, before seeding and running tests. This prevents flakes from the stack still booting.

### Test isolation strategy
The suite resets+seeds once in `globalSetup` for a clean baseline. Mutating tests (create/status/assign) create their own tasks with unique titles (e.g. title suffixed by a per-test nonce) and assert on those, so tests don't depend on ordering. The list-empty assertion runs first / against the freshly seeded state.
- *Alternative considered:* reset+seed before every test — slower; deferred unless flakiness demands per-test isolation.

## Risks / Trade-offs

- **Reset wipes the shared dev database** → The reset/seed step is destructive; document clearly that the e2e flow drops task data. Use the same Postgres the stack runs on; acceptable for an MVP with no protected data.
- **Host must reach Postgres on 5432** → compose already publishes it; document that nothing else must occupy 5432 and that the override `DATABASE_URL` targets `localhost`, not the compose network name `postgres`.
- **Container boot timing** → mitigated by the readiness poll with a generous timeout; rely on compose healthchecks for Postgres/backend where available.
- **Single-browser coverage** → Chromium only initially; acceptable for a basic suite, expandable later.
- **Seed uses `upsert`** → re-seeding without a full reset would not remove stray tasks; that's why the flow does a real reset (drop) before seed.

## Migration Plan

1. Add `e2e` workspace with Playwright config, globalSetup, and tests.
2. Add repo-root scripts: bring stack up, reset+seed, run e2e, tear down (and a combined "e2e" script).
3. Document the flow in the README / `e2e/README.md`.
4. Rollback: remove the `e2e` workspace and scripts; no production code is affected.

## Open Questions

- Should the e2e flow run against a **separate** e2e database rather than the shared `taskdb`, to avoid clobbering local dev data? (Proposed default: use `taskdb` for the MVP; revisit if it becomes annoying.)
- Should this be wired into CI now or in a follow-up change? (Proposed: follow-up.)
