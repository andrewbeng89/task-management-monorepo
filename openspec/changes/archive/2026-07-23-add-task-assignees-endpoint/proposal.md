## Why

Assigning a task today requires the client to already know a suitable developer's id. There is no way to discover which developers are eligible for a task. Exposing the candidate developers for a task makes the existing assignment flow usable and sets up the frontend's assignee-picker.

## What Changes

- Add `GET /api/tasks/:id/assignees` to the task API.
- The endpoint SHALL return the list of developers who are **candidates** to be assigned to the task:
  - the developer has **at least one** of the task's required skills, and
  - the developer is **not currently assigned** to the task (the task's current assignee, if any, is excluded).
- Mirror the existing assignment rule for the no-required-skills case: when a task requires no skills, every developer is a candidate (still excluding the current assignee).
- Return `404` when the task does not exist; return `400` for an invalid task id.
- Document the endpoint in the OpenAPI registry alongside the other task routes.

## Capabilities

### New Capabilities
<!-- None. This extends the existing task-api capability. -->

### Modified Capabilities
- `task-api`: Adds a new requirement for retrieving the eligible (skill-matched, not-yet-assigned) developers for a task via `GET /api/tasks/:id/assignees`.

## Impact

- **Backend code**: `backend/src/routes/tasks.ts` (new route), `backend/src/services/tasks.ts` (new query), `backend/src/schemas/task.ts` (response schema for the developer list), `backend/src/openapi.ts` (path registration). Reuses the existing developer serializer.
- **No schema/migration changes**: reads existing `Task`, `TaskSkill`, `Developer`, and `DeveloperSkill` tables.
- **No breaking changes**: additive, read-only endpoint.
