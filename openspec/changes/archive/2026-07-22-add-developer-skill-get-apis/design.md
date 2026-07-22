## Context

The backend already has a task API built on a consistent stack (Express 5, Prisma 7, Zod validation, `@asteasolutions/zod-to-openapi` for a served OpenAPI 3.1 doc, a central error handler, and per-entity serializers). This change adds two read endpoints — `GET /api/developers/:id` and `GET /api/skills/:id` — that must slot into the same patterns so the codebase and the OpenAPI document stay coherent.

The relations exist in the model already: `Developer` ↔ `Skill` via `developer_skills` (a developer *has* skills). No migration is required.

## Goals / Non-Goals

**Goals:**
- Return an entity's own fields plus its **downstream** relationships only (the relations it points to / depends on), never the entities that reference it (upstream).
- Reuse the established layering (routes → services → Prisma), Zod validation, serializers, error handling, and OpenAPI registration.
- Keep the OpenAPI document accurate by registering the new paths.

**Non-Goals:**
- List endpoints, filtering, pagination — the request is by-id only.
- Create/update/delete for developers or skills.
- Returning upstream relations (developer's assigned tasks; a skill's developers or requiring tasks).
- Auth.

## Decisions

### Decision 1: Response shapes — downstream relationships only

The guiding rule: include an entity's own columns plus the relations it owns/points to (downstream); exclude relations where another entity references it (upstream).

- `GET /api/developers/:id` → `{ id, name, createdAt, updatedAt, skills: [{ id, name }] }`.
  - `skills` is downstream (a developer *has* skills). Tasks assigned to the developer are **excluded** — a task references the developer via `assignee_id`, so it is upstream.
- `GET /api/skills/:id` → `{ id, name, createdAt }`.
  - A skill has no outgoing relationships. Developers (`developer_skills`) and tasks (`task_skills`) both reference the skill, so both are upstream and **excluded**. The response is the skill's own fields only.

Rationale: matches the explicit product decision that these endpoints expose downstream relationships only, keeping payloads focused and avoiding leaking reverse references. **Alternative considered:** embedding reverse relations (assigned tasks, skill's developers/tasks) — rejected per the stated rule.

### Decision 2: Reuse existing patterns and building blocks

New files mirror the task API layout:
- `src/schemas/developer.ts`, `src/schemas/skill.ts` — Zod response schemas registered for OpenAPI; reuse the existing UUID id-param pattern.
- `src/serializers/developer.ts`, `src/serializers/skill.ts` — Prisma entity (+ `include`) → DTO, mirroring `serializers/task.ts`. The developer serializer includes `skills: { include: { skill: true } }`; the skill serializer needs no relation includes.
- `src/services/developers.ts`, `src/services/skills.ts` — `getDeveloperById` / `getSkillById`, throwing the existing `notFound` (`HttpError`) helper on miss.
- `src/routes/developers.ts`, `src/routes/skills.ts` — one `GET /:id` each, Zod-validating the path param.
- `src/openapi.ts` — register the two new paths and component schemas (`Developer`, `Skill` already exist as component names to reuse/align).
- `src/index.ts` — mount `/api/developers` and `/api/skills` before the error handler.

The existing `errorHandler` already maps `HttpError`→status, Prisma `P2025`→404, and ZodError→400, so no new error handling is required.

### Decision 3: Id validation

Path ids are validated with the same Zod UUID param schema the task routes use: malformed ids yield `400`, well-formed-but-unknown ids reach the service and yield `404`.

## Risks / Trade-offs

- **[OpenAPI drift]** forgetting to register the new paths → Mitigation: registration lives in `src/openapi.ts`; verification asserts `GET /api/openapi.json` lists `/api/developers/{id}` and `/api/skills/{id}`.
- **[Component name reuse]** the task API may already register `Developer`/`Skill` component schemas with a different shape → Mitigation: reconcile names during implementation (reuse if identical, otherwise use distinct names like `DeveloperDetail`/`SkillDetail`).

## Migration Plan

Additive, runtime-only, read-only. Deploy by merging the new `src/` modules and router mounts; rollback = revert the commit. No database change.

## Open Questions

- None blocking. List endpoints, if later needed, are a separate change.
