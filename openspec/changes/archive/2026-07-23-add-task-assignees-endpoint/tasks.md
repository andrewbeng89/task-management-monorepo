## 1. Service layer

- [x] 1.1 Add `listTaskAssignees(taskId)` to `backend/src/services/tasks.ts`: fetch the task with its `skills` (skillIds) and `assigneeId`, throwing `404` (via `notFound`) if the task does not exist
- [x] 1.2 Query developers with a single Prisma `findMany` using `developerInclude`: match `skills.some.skillId in requiredSkillIds` when the task has required skills (omit the skill filter when it has none), and exclude the current assignee with `id: { not: assigneeId }` when an assignee is set
- [x] 1.3 Return the results mapped through `serializeDeveloper`

## 2. Schema & response contract

- [x] 2.1 In `backend/src/schemas/task.ts`, add a developer-list response schema (array of the existing developer DTO shape) for the endpoint, reusing the developer schema so the wire contract matches `serializeDeveloper`

## 3. Route

- [x] 3.1 Add `GET /:id/assignees` to `backend/src/routes/tasks.ts`, parsing params with `TaskIdParamSchema` and returning `await listTaskAssignees(id)`

## 4. OpenAPI documentation

- [x] 4.1 Register `GET /api/tasks/{id}/assignees` in `backend/src/openapi.ts` with the developer-list response schema and `200`, `400` (invalid id), and `404` (task not found) responses, matching the style of the existing task paths

## 5. Verification

- [x] 5.1 Run the backend build (`npm run build` in `backend/`) and resolve any type errors
- [x] 5.2 Manually verify against a seeded DB: a task requiring a skill returns only developers with that skill; the current assignee is excluded; a skill-less task returns all developers except the assignee; a task with no matching developers returns `[]`
- [x] 5.3 Verify error cases: unknown task id returns `404`, invalid id returns `400`, and both responses are JSON with the standard error shape
