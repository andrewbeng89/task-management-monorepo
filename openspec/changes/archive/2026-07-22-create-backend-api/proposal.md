## Why

The backend currently exposes only health endpoints — there is no API for the core task-management domain, so the frontend has nothing to build against. We need a documented, OpenAPI-described HTTP API for tasks so clients can create, read, assign, and progress tasks against the existing Prisma/PostgreSQL data model.

## What Changes

- Add an Express-based REST API under `/api/tasks`, backed by the existing Prisma `Task` model:
  - **Create** a task (title, optional status, optional required skills, optional parent).
  - **Retrieve** tasks (list all, and fetch a single task by id).
  - **Assign** a task to a developer, allowed only when the developer has **at least one** of the skills the task requires.
  - **Update** a task's status (TODO / IN_PROGRESS / DONE).
- Provide an **OpenAPI 3.1 specification** describing every endpoint, request/response schema, and error, and serve it from the API. The implementation SHALL conform to this spec.
- Add request validation and consistent JSON error responses.
- Wire routes into the existing Express app (`src/index.ts`) alongside the current health checks.

## Capabilities

### New Capabilities
- `task-api`: HTTP endpoints under `/api/tasks` for creating, retrieving, assigning, and updating the status of tasks, including the skill-match assignment rule.
- `api-documentation`: An OpenAPI 3.1 specification that describes the API and is served by the backend; the implementation conforms to it.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->

## Impact

- **Code**: `backend/src/` — new route/controller/service and validation modules; `src/index.ts` wiring. Reuses `src/db.ts` (Prisma client).
- **Dependencies**: likely a validation library (e.g. `zod`) and OpenAPI tooling/serving; confirmed in design.
- **Data**: read/write against existing tables (`tasks`, `developers`, `developer_skills`, `task_skills`); no schema migration required.
- **Consumers**: unblocks the frontend (React Query + `ky`) to integrate against a documented contract.
- **No breaking changes**: purely additive to the running service.
