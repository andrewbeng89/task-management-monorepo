## Why

Tasks often decompose into subtasks, and a parent task shouldn't be marked complete while its subtasks are still open. The data model already supports nesting (`Task.parentId` self-relation), but nothing in the API or UI exposes it. This change surfaces subtasks: it lets users build a task with nested subtasks at creation time and enforces "a task can only be Done when its subtasks are Done".

## What Changes

**Backend (`task-api`)**
- Add a boolean field (`allSubtasksDone`) to every task representation from `GET /api/tasks` (and `GET /api/tasks/:id`) that is `true` when all of the task's direct subtasks are `DONE` (and `true` when it has no subtasks).
- Update `PATCH /api/tasks/:id/status` to reject setting a task to `DONE` while any of its direct subtasks are not `DONE` (returns `409 Conflict`).
- Creating a subtask needs no API change — `POST /api/tasks` already accepts an optional `parentId`.

**Frontend (`task-web-ui`)**
- Task list page: display **only root-level tasks** (`parentId === null`) for now.
- Disable the **"Done"** option in a row's Status `<select>` when that task's `allSubtasksDone` is `false`.
- Abstract the task creation form out of `TaskCreatePage` into a reusable `CreateTask` component.
- Extend `CreateTask` with an **"Add subtask"** button that dynamically renders a nested `CreateTask` beneath and indented to its parent, to arbitrary depth. Added subtask blocks can be removed; each block requires a title.
- On submit, create the whole tree top-down (root first via `POST /api/tasks`, then each subtask with its parent's returned id); navigate to the task list on success.

**Verification (this change)**
- Confirm the existing Prisma schema already supports nested subtasks via `Task.parentId` (it does — verified: self-relation `TaskToSubtasks`, `onDelete: Cascade`).

## Capabilities

### New Capabilities
<!-- None. This extends existing capabilities. -->

### Modified Capabilities
- `task-api`: task representations gain an `allSubtasksDone` flag, and the status-update endpoint enforces the subtasks-done rule for `DONE`.
- `task-web-ui`: the list page shows only root tasks and disables "Done" when subtasks are incomplete; the creation form is componentized and supports building nested subtasks.

## Impact

- **Backend**: `serializers/task.ts` (+`taskInclude` subtasks, `allSubtasksDone`), `services/tasks.ts` (`updateTaskStatus` guard), `schemas/task.ts` (`TaskSchema` field), `openapi.ts` (409 response on status). No schema/migration change.
- **Frontend**: new `components/CreateTask.tsx`, `pages/TaskCreatePage.tsx` (uses it), `pages/TaskListPage.tsx` (root filter + disabled Done), `lib/api.ts` (`Task.allSubtasksDone`, `CreateTaskInput.parentId`).
- **Constraint / risk**: tree creation is multiple sequential `POST`s with no transaction — a mid-tree failure can leave partial data; the UI reports what succeeded. (No transactional create endpoint, per scope.)
