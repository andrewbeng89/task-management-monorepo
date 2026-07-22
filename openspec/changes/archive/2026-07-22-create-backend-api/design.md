## Context

The backend is Express 5 + Prisma 7 (PostgreSQL via `@prisma/adapter-pg`). Today `src/index.ts` only mounts health endpoints and a Prisma client from `src/db.ts`. The data model already exists: `Task` (title, `TaskStatus`, optional `assignee`, self-referencing `parent`, M2M `requiredSkills` via `task_skills`), `Developer` (M2M skills via `developer_skills`), and `Skill`. Seed data provides `Frontend`/`Backend` skills and four developers.

This change adds the task HTTP API and an OpenAPI 3.1 contract. No schema migration is needed — all reads/writes go through the existing tables. Consumer is the frontend (React Query + `ky`), which currently has no contract to build against.

## Goals / Non-Goals

**Goals:**
- REST endpoints under `/api/tasks` for create, retrieve (list + by id), assign, and update-status.
- Enforce the assignment rule: a developer may be assigned only if they share **at least one** required skill with the task (any developer if the task requires none).
- A single source of truth for validation **and** the OpenAPI document, so the implementation provably conforms to the spec.
- Consistent JSON error responses and input validation.

**Non-Goals:**
- Task deletion, full task editing (title/skills/parent updates beyond what create covers), pagination, filtering, and auth — out of scope for this change.
- Frontend integration.
- AI features (the `@google/genai` dependency is not used here).

## Decisions

### Decision 1: Route shape — focused sub-resources

- `POST /api/tasks` — create
- `GET /api/tasks` — list
- `GET /api/tasks/:id` — fetch one
- `PATCH /api/tasks/:id/assignee` — assign (body `{ "developerId": "..." }`)
- `PATCH /api/tasks/:id/status` — update status (body `{ "status": "IN_PROGRESS" }`)

Rationale: the two mutations are discrete, well-defined operations with distinct validation and business rules. Dedicated sub-resource endpoints keep each handler small and unambiguous, versus a single `PATCH /api/tasks/:id` that would need conditional logic and partial-update semantics. **Alternative considered:** one generic PATCH — rejected for ambiguity (e.g. is omitting `assigneeId` an unassign or a no-op?).

### Decision 2: OpenAPI strategy — code-first from Zod (single source of truth)

Use **`zod`** for request/response schemas and **`@asteasolutions/zod-to-openapi`** to register those schemas and generate the OpenAPI 3.1 document. The same Zod schema validates the request at runtime and defines the documented shape, so the implementation cannot silently drift from the spec.

- `src/schemas/*` — Zod schemas (CreateTaskBody, AssignBody, StatusBody, Task/Developer/Skill/Error responses), registered with an `OpenAPIRegistry`.
- `src/openapi.ts` — builds the document from the registry; served at `GET /api/openapi.json`.
- Optionally mount Swagger UI at `/api/docs` (nice-to-have, not required by spec).

**Alternatives considered:**
- **Spec-first with `express-openapi-validator`** (hand-write `openapi.yaml`, validate against it): strong conformance enforcement, but the YAML is maintained by hand and can drift from Zod/DB types. Rejected in favor of generating from one source.
- **Manual OpenAPI object + separate validation**: highest drift risk. Rejected.

Risk to verify at implementation: `@asteasolutions/zod-to-openapi` compatibility with the installed Zod major version — pin compatible versions during task 1.

### Decision 3: Layering

Thin routers → services → Prisma:
- `src/routes/tasks.ts` — Express router, parses/validates via Zod, calls services, shapes responses.
- `src/services/tasks.ts` — Prisma queries + business rules (skill-match), throws typed errors.
- `src/lib/errors.ts` — `HttpError` (statusCode + message) and helpers.
- `src/middleware/error-handler.ts` — central error middleware mapping errors → JSON.
- `src/index.ts` — mount `/api/tasks` router, `/api/openapi.json`, and the error handler after routes.

### Decision 4: Skill-match enforcement

In the assign service: load the task's `requiredSkillIds` (from `task_skills`) and the developer's `skillIds` (from `developer_skills`). If the task has required skills, require a non-empty intersection; if it has none, allow any developer. On mismatch, throw `HttpError(409)`. Missing task or developer → `HttpError(404)`. This is a cross-table invariant that cannot be expressed as a DB constraint, so it lives in the service layer.

### Decision 5: Error mapping and response shape

- Error body shape: `{ "error": string, "details"?: unknown }` (details carries Zod field issues on validation failures).
- Zod parse failure → `400`; `HttpError` → its status; Prisma `P2025` (record not found) → `404`; malformed JSON (Express body parser) → `400`; anything else → `500`.
- Express 5 forwards rejected promises from async handlers to the error middleware automatically, so handlers can be plain `async` without a wrapper.

### Decision 6: Task response DTO

A serializer maps the Prisma entity to a stable DTO: `id`, `title`, `status`, `assignee` (`{ id, name }` or `null`), `requiredSkills` (`[{ id, name }]`), `parentId`, `createdAt`, `updatedAt`. This decouples the wire format from Prisma's relation shape and matches the documented schema.

## Risks / Trade-offs

- **[zod-to-openapi ↔ Zod version mismatch]** → Pin compatible versions in task 1; if incompatible, fall back to hand-authored `openapi.json` served statically (still satisfies the api-documentation spec).
- **[Doc/impl drift]** → Mitigated by generating the document from the same Zod schemas used for validation.
- **[Referential integrity on create]** (`parentId`/`requiredSkillIds` may not exist) → catch Prisma connect/FK errors and return `400`/`422`, or pre-check existence for clearer messages; decide during implementation.
- **[Over-engineering]** → Keep services small; no repository abstraction beyond Prisma.

## Migration Plan

Additive and runtime-only. Deploy by merging new deps + `src/` modules; the new routes mount alongside existing health checks. Rollback = revert the commit; no database migration to undo.

## Open Questions

- None blocking. Swagger UI at `/api/docs` is optional and can be dropped if it adds dependency weight.
