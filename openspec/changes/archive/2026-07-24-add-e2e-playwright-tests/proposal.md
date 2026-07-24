## Why

The app has capability specs for the web UI and task API but no automated end-to-end coverage that exercises the two together through a real browser. A basic Playwright suite gives us confidence that the core user journeys (view tasks, create a task, change status, assign a developer) work against the actual containerized stack, and gives future changes a regression safety net.

## What Changes

- Add Playwright as the end-to-end browser testing framework, configured to run against the containerized build (Postgres + backend + frontend via Docker Compose).
- Add a small, focused suite covering the core journeys defined in the `task-web-ui` spec: task list rendering, creating a single task, creating a nested subtask tree, updating a task's status, and assigning a developer.
- Add a deterministic database reset-and-seed step so tests start from a known state (seeded skills and developers, no tasks), invoked where needed.
- Add repo-level scripts and documentation for running the e2e suite locally and the setup/teardown of the containerized environment.

## Capabilities

### New Capabilities
- `e2e-testing`: Browser-based end-to-end tests that drive the running app through the UI, run against the containerized build, and use a deterministic reset-and-seed database fixture; covers the core task-management user journeys.

### Modified Capabilities
<!-- None — this change adds test coverage against existing behavior; it does not change any existing spec's requirements. -->

## Impact

- **New dependency**: `@playwright/test` (dev), plus a root `e2e/` (or `tests/e2e/`) workspace/directory and Playwright browser binaries.
- **New scripts**: repo-root scripts to reset+seed the DB and run the Playwright suite against the Docker Compose stack.
- **Backend**: relies on existing `db:reset` / `db:seed` scripts; no runtime code changes.
- **CI/local**: documented flow to bring up the containerized stack, seed, run tests, and tear down.
- **No changes** to `task-api`, `task-web-ui`, or other existing capability behavior.
