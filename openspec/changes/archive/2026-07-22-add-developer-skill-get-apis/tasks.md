## 1. Schemas and serializers

- [x] 1.1 Add `src/schemas/developer.ts`: Zod `DeveloperDetail` response schema (`id`, `name`, `createdAt`, `updatedAt`, `skills: [{id,name}]`) registered for OpenAPI; reuse the shared UUID id-param
- [x] 1.2 Add `src/schemas/skill.ts`: Zod `SkillDetail` response schema (`id`, `name`, `createdAt`) registered for OpenAPI
- [x] 1.3 Add `src/serializers/developer.ts` (include `skills: { include: { skill: true } }`; map to DTO — no assigned tasks)
- [x] 1.4 Add `src/serializers/skill.ts` (own fields only; no relation includes)

## 2. Services

- [x] 2.1 Add `src/services/developers.ts` `getDeveloperById(id)` — load with skills, throw `notFound` on miss
- [x] 2.2 Add `src/services/skills.ts` `getSkillById(id)` — load own fields, throw `notFound` on miss

## 3. Routes and wiring

- [x] 3.1 Add `src/routes/developers.ts` with `GET /:id` (validate param with Zod, call service, return DTO)
- [x] 3.2 Add `src/routes/skills.ts` with `GET /:id`
- [x] 3.3 Mount `/api/developers` and `/api/skills` in `src/index.ts` before the error handler

## 4. OpenAPI registration

- [x] 4.1 Register `GET /api/developers/{id}` and `GET /api/skills/{id}` (path param, 200 with the detail schema, 400 and 404 referencing the shared `Error` schema) in `src/openapi.ts`
- [x] 4.2 Reconcile component names with the existing `Developer`/`Skill` components (reuse if identical, else use `DeveloperDetail`/`SkillDetail`)

## 5. Verification

- [x] 5.1 Typecheck (`npx tsc --noEmit`)
- [x] 5.2 `GET /api/developers/:id` (seeded, e.g. Carol) → 200 with `skills` (both) and **no** tasks field
- [x] 5.3 `GET /api/skills/:id` (seeded, e.g. Frontend) → 200 with `id`, `name`, `createdAt` only (no developers/tasks)
- [x] 5.4 Unknown id → 404; malformed id → 400 (both endpoints), JSON error shape
- [x] 5.5 `GET /api/openapi.json` lists `/api/developers/{id}` and `/api/skills/{id}`

## 6. Documentation

- [x] 6.1 Update `backend/README.md` endpoint table with the two new GET endpoints
