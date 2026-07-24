## 1. Scaffold the e2e workspace

- [x] 1.1 Create an `e2e/` directory and add it to the root `package.json` `workspaces` array
- [x] 1.2 Add `e2e/package.json` with `@playwright/test` as a dev dependency and scripts (`test`, `test:headed`, `install:browsers`)
- [x] 1.3 Run `npm install` and install Chromium via `npx playwright install --with-deps chromium`
- [x] 1.4 Add `e2e/.gitignore` (or extend root) for `playwright-report/`, `test-results/`, and `.last-run.json`

## 2. Playwright configuration and fixtures

- [x] 2.1 Add `e2e/playwright.config.ts`: `testDir: tests`, `baseURL` from env (default `http://localhost:3000`), Chromium project, sensible timeouts/retries, HTML reporter, and `globalSetup`
- [x] 2.2 Add `e2e/global-setup.ts` that (a) polls the frontend `baseURL` and a backend endpoint (`GET /api/tasks` or `/api/openapi.json`) until ready with a timeout, then (b) resets and seeds the database
- [x] 2.3 Implement the reset+seed step by invoking the backend `db:reset`/`db:seed` scripts with a `DATABASE_URL` pointed at `localhost:5432` (host-published Postgres), so tests start from the seeded baseline (skills + developers, no tasks)
- [x] 2.4 Add small test helpers in `e2e/tests/helpers.ts` (e.g. unique-title generator, selectors/getByRole helpers for the task table and create form)

## 3. Core journey tests

- [x] 3.1 `list.spec.ts` — navigate to `/`, assert redirect to `/tasks`, layout landmarks present, and the seeded empty-state message with the Title/Skills/Status/Assignee columns and no data rows
- [x] 3.2 `create-task.spec.ts` — on `/tasks/new`, enter a unique title and submit via the UI; assert navigation to `/tasks` and the new task row appears with its title and default status
- [x] 3.3 `create-subtask.spec.ts` — use "Add subtask", fill parent + subtask titles, submit; assert the subtask row renders beneath and indented relative to its parent
- [x] 3.4 `update-status.spec.ts` — create a task, change its status control to a different value; assert the row shows the new human-readable status label
- [x] 3.5 `assign-developer.spec.ts` — create a task (with a skill so a candidate exists), open its assignee control, select a developer; assert the row shows that developer as assignee

## 4. Orchestration scripts

- [x] 4.1 Add repo-root scripts: `e2e:up` (docker compose up --build -d), `e2e:seed` (reset+seed against localhost), `e2e:test` (run Playwright), `e2e:down` (docker compose down)
- [x] 4.2 Add a combined `e2e` script that runs up → wait/seed (via globalSetup) → test, and document tearing down with `e2e:down`
- [x] 4.3 Ensure `DATABASE_URL` for the seed step targets `localhost` (not the compose network name `postgres`) and is set by the script/env, not hard-coded

## 5. Verify and document

- [x] 5.1 Run the full flow against the containerized build and confirm all specs pass, twice in a row (repeatability)
- [x] 5.2 Add `e2e/README.md` documenting prerequisites (Docker, ports 3000/6000/5432 free), the command flow, and that the reset step is destructive to task data
- [x] 5.3 Add a short "End-to-end tests" section to the root `README.md` linking to `e2e/README.md`
- [x] 5.4 Run `npm run lint` and `npm run format:check` and fix any issues in the new files
