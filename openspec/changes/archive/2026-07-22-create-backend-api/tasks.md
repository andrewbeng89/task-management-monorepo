## 1. Dependencies and scaffolding

- [x] 1.1 Install `zod` and `@asteasolutions/zod-to-openapi` (pin versions compatible with the installed Zod major); verify they build under the project's TypeScript config
- [x] 1.2 Create the module layout: `src/routes/`, `src/services/`, `src/schemas/`, `src/lib/`, `src/middleware/`

## 2. Shared building blocks

- [x] 2.1 Add `src/lib/errors.ts` with an `HttpError` (statusCode + message) and helpers
- [x] 2.2 Add `src/middleware/error-handler.ts` mapping Zod errors → 400, `HttpError` → its status, Prisma `P2025` → 404, malformed JSON → 400, else → 500, all as `{ error, details? }` JSON
- [x] 2.3 Add a Task serializer (Prisma entity → DTO: `id`, `title`, `status`, `assignee`, `requiredSkills`, `parentId`, timestamps)

## 3. Validation and OpenAPI schemas

- [x] 3.1 Define Zod schemas in `src/schemas/`: CreateTaskBody, AssignBody, StatusBody, and Task/Developer/Skill/Error response schemas
- [x] 3.2 Register schemas + paths with an `OpenAPIRegistry` and build the document in `src/openapi.ts`
- [x] 3.3 Serve the document at `GET /api/openapi.json` (optionally mount Swagger UI at `/api/docs`)

## 4. Task services (business logic)

- [x] 4.1 `createTask` — create with optional status/parent/required skills; surface unknown `parentId`/`requiredSkillIds` as 400/422
- [x] 4.2 `listTasks` and `getTaskById` — include assignee and required skills; 404 when not found
- [x] 4.3 `assignTask` — enforce skill-match: developer must share ≥1 required skill; any developer if the task requires none; 409 on mismatch, 404 for missing task/developer
- [x] 4.4 `updateTaskStatus` — set status to a valid `TaskStatus`; 404 when not found

## 5. Routes and wiring

- [x] 5.1 Implement `src/routes/tasks.ts`: `POST /api/tasks`, `GET /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id/assignee`, `PATCH /api/tasks/:id/status` (validate with Zod, call services, shape DTOs)
- [x] 5.2 Mount the tasks router and `/api/openapi.json` in `src/index.ts`, and register the error handler after routes (keep existing health endpoints)

## 6. Verification

- [x] 6.1 Create a task (title only) → 201 with `TODO`; create with `requiredSkillIds` → skills linked
- [x] 6.2 List and get-by-id return assignee + required skills; unknown id → 404
- [x] 6.3 Assign to a developer sharing a required skill → 200; assign lacking all required skills → 409; task with no required skills → any developer 200
- [x] 6.4 Update status to valid value → 200; invalid status → 400; unknown task → 404
- [x] 6.5 `GET /api/openapi.json` returns a valid OpenAPI 3.1 doc covering all endpoints; spot-check a response body against its documented schema
- [x] 6.6 Confirm error responses are JSON with the documented shape (validation, not-found, malformed JSON)

## 7. Documentation

- [x] 7.1 Update `backend/README.md` with the new endpoints, how to run, and where to find the OpenAPI doc (`/api/openapi.json`)
