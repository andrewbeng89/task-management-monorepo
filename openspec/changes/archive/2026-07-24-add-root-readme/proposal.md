## Why

The monorepo has no root-level `README.md`. New contributors have to piece together the tech stack, how to run things locally, and the rationale behind key decisions from scattered per-package READMEs and the code itself. A single entry-point README makes the project approachable and records the MVP's intentional scope.

## What Changes

- Add a root-level `README.md` documenting the project, with these sections:
  - **Overview** — a one-paragraph description of the task-management app and the monorepo layout (`backend/`, `frontend/`).
  - **Tech stack** — backend (Node/Express, TypeScript, Prisma + PostgreSQL, Zod, OpenAPI via zod-to-openapi), frontend (React 19, Vite, Tailwind CSS 4, react-router-dom, ky, TanStack), and tooling (npm workspaces, oxlint, Prettier, Docker Compose).
  - **Local development setup** — prerequisites, install, environment (`.env` from `.env.example`), running via Docker Compose (`npm run docker:up`) and/or running backend + frontend workspaces directly, database provisioning (Prisma migrate + seed).
  - **Engineering / architectural decisions** — a **draft** capturing notable choices (monorepo + workspaces, Prisma driver adapter, spec-driven API with OpenAPI, skill-based assignment, recursive subtasks, accessibility-first frontend). Explicitly marked as a draft for the author to refine.
  - **Assumptions (MVP)** — the intentional simplifications: no authentication/login or user accounts, no authorization, single-tenant, no handling of concurrent-user conflicts (last-write-wins), and any other MVP scope limits.
- No code or behavior changes — documentation only.

## Capabilities

### New Capabilities
- `project-documentation`: A root `README.md` that documents the tech stack, local development setup, architectural decisions (draft), and MVP assumptions for the monorepo.

### Modified Capabilities
<!-- None. -->

## Impact

- **Files**: new `README.md` at the repository root.
- **No code, API, dependency, or schema changes.**
- Per-package READMEs (`backend/README.md`, `frontend/README.md`) remain; the root README links to them rather than duplicating their detail.
