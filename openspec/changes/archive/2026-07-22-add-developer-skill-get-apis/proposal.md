## Why

The task API can assign tasks to developers and require skills, but clients have no way to read a developer or a skill. To build UI (e.g. an assignee picker or a skill detail view) the frontend needs to fetch a developer's full profile and a skill's full detail by id.

## What Changes

- Add `GET /api/developers/:id` returning the developer's own fields plus its downstream relationships only: `id`, `name`, timestamps, and the developer's skills. Tasks assigned to the developer are excluded (they reference the developer — an upstream relationship).
- Add `GET /api/skills/:id` returning the skill's own fields only: `id`, `name`, `createdAt`. Developers and tasks that reference the skill are excluded (upstream); a skill has no downstream relationships.
- Both endpoints return `404` for unknown ids and use the existing JSON error shape.
- Register both endpoints (request params, success and error responses, component schemas) in the served OpenAPI 3.1 document, following the existing Zod → OpenAPI pattern.

## Capabilities

### New Capabilities
- `developer-skill-api`: Read endpoints to retrieve a single developer and a single skill by id, including their related skills/developers and tasks.

### Modified Capabilities
- `api-documentation`: Broaden the "describes the API" requirement so the OpenAPI document covers all endpoints (developers and skills), not only `/api/tasks`.

## Impact

- **Code**: `backend/src/` — new `schemas/`, `serializers/`, `services/`, and `routes/` modules for developers and skills; new path registrations in `src/openapi.ts`; router mounts in `src/index.ts`. Reuses `HttpError`, the error handler, and the Prisma client.
- **Data**: read-only against existing tables (`developers`, `skills`, `developer_skills`, `task_skills`, `tasks`); no migration.
- **Dependencies**: none new (reuses `zod`, `@asteasolutions/zod-to-openapi`, Prisma).
- **No breaking changes**: purely additive read endpoints.
