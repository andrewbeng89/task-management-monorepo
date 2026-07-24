# End-to-end tests (Playwright)

Browser-based end-to-end tests that drive the task-management app through a real
browser against the **containerized build** (Docker Compose: Postgres + backend +
frontend). Tests interact only through the UI.

## What's covered

The core journeys from the `task-web-ui` capability:

- **View list** — root redirects to `/tasks`, layout landmarks render, and the
  freshly-seeded database shows the empty state (`01-list.spec.ts`).
- **Create a task** — create a single task via the form and see it in the list
  (`02-create-task.spec.ts`).
- **Create a nested subtask** — add a subtask block and see it rendered beneath
  its parent (`03-create-subtask.spec.ts`).
- **Update status** — change a task's status control and see the new label
  (`04-update-status.spec.ts`).
- **Assign a developer** — assign a candidate developer to a task
  (`05-assign-developer.spec.ts`).

Tests run **serially** against a single seeded database (`workers: 1`), and the
list empty-state test runs first (numeric filename prefixes).

## Prerequisites

- **Docker + Docker Compose** running.
- Host ports **3000** (frontend), **6000** (backend), and **5432** (Postgres) free.
- Dependencies installed and the Chromium browser downloaded:

  ```bash
  npm install                                   # from the repo root
  npm run install:browsers --workspace=e2e      # downloads Chromium
  ```

## Running

From the **repo root**:

```bash
npm run e2e:up      # build & start the containerized stack (detached)
npm run e2e:test    # run the Playwright suite (waits for readiness, then resets+seeds)
npm run e2e:down    # stop the stack when done
```

Or the combined convenience script (up → test), then tear down:

```bash
npm run e2e         # e2e:up && e2e:test
npm run e2e:down
```

### How readiness and seeding work

Before any test runs, `global-setup.ts`:

1. Polls the frontend (`http://localhost:3000`) and the API **through the frontend's
   `/api` proxy** (`http://localhost:3000/api/tasks`) until both respond. We do not
   probe the backend's own port `6000` directly — it is on the browser/undici
   unsafe-port blocklist (X11), so `fetch` rejects it with "bad port".
2. Resets the database via `db:reset` (`prisma migrate reset --force`) and then
   seeds it via `db:seed` (`migrate reset` does **not** run the seed in this
   project's Prisma config, so seeding is a separate, explicit step).

### Two configuration choices baked into `e2e:up`

The `e2e:up` script starts the stack with two overrides so the app-under-test is
deterministic and browser-reachable:

- **`VITE_API_URL=/api`** — the frontend calls the API at the same origin and nginx
  proxies `/api` to the backend. (A real browser cannot call `http://localhost:6000`
  directly — port 6000 is a blocked "unsafe port".)
- **`GEMINI_API_KEY=` (empty)** — disables best-effort Gemini skill inference on task
  creation, so creating a task is fast and doesn't depend on an external API. Testing
  inference is an explicit non-goal of this suite; the app is designed to work
  identically with the key unset. Tests that need skills select them explicitly.

> ⚠️ **The reset step is destructive.** It drops and recreates the database used by
> the stack (`taskdb`) — all existing task data is deleted and replaced with the
> seeded baseline (default skills + developers, no tasks). Don't point it at a
> database whose contents you care about.

## Configuration (env vars)

| Variable            | Default                                                              | Purpose                                                                           |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `E2E_BASE_URL`      | `http://localhost:3000`                                              | Frontend base URL the tests target                                                |
| `E2E_API_READY_URL` | `<E2E_BASE_URL>/api/tasks`                                           | API URL polled for readiness (via the `/api` proxy)                               |
| `E2E_DATABASE_URL`  | `postgresql://postgres:postgres@localhost:5432/taskdb?schema=public` | DB the reset+seed targets (host `localhost`, **not** the compose name `postgres`) |
| `E2E_SKIP_SEED`     | _(unset)_                                                            | Set to `1` to skip reset+seed (debugging)                                         |

## Viewing results

```bash
npm run report --workspace=e2e    # open the HTML report from the last run
```
