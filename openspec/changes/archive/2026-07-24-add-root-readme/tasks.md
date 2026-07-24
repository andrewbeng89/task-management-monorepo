## 1. Author the root README

- [x] 1.1 Create `README.md` at the repo root with a title and an **Overview** section (what the app does + monorepo layout: `backend/`, `frontend/`, `openspec/`)
- [x] 1.2 **Tech stack** section: a table/list covering backend (Node + Express, TypeScript, Prisma + PostgreSQL, Zod, OpenAPI via zod-to-openapi), frontend (React 19, Vite, Tailwind CSS 4, react-router-dom, ky), and tooling (npm workspaces, oxlint, Prettier, Docker Compose)
- [x] 1.3 **Local development setup** section: prerequisites (Node, Docker), install (`npm install`), env (`cp .env.example .env`), the Docker Compose path (`npm run docker:up`), and the direct-workspaces path (start Postgres, `npm run prisma:migrate` + `npm run db:seed` in `backend`, then `npm run dev:backend` / `npm run dev:frontend`); note the ports (frontend 3000, backend 6000, db 5432) and link to `backend/README.md` and `frontend/README.md`
- [x] 1.4 **Engineering / architectural decisions** section: a bulleted draft of notable decisions, prefixed with a clear "Draft — to be refined" note
- [x] 1.5 **Assumptions (MVP)** section: no auth/login or user accounts; no authorization; single-tenant; no concurrent-edit conflict handling (last-write-wins); other intentional scope limits

## 2. Verify

- [x] 2.1 Confirm every command referenced in the setup section exists in the relevant `package.json` (root or workspace) and the ports match `docker-compose.yml`
- [x] 2.2 Confirm all five required sections are present and the decisions section is clearly labelled a draft
- [x] 2.3 Run `npm run format:check` (or `prettier --check README.md`) so the file matches repo formatting
