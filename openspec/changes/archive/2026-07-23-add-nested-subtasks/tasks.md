## 1. Verify schema support

- [x] 1.1 Confirm the Prisma schema already supports nested subtasks via `Task.parentId` (self-relation `TaskToSubtasks`, `onDelete: Cascade`) and that `POST /api/tasks` accepts `parentId` — no schema/migration change needed

## 2. Backend: allSubtasksDone field

- [x] 2.1 Add `subtasks: { select: { status: true } }` to `taskInclude` in `backend/src/serializers/task.ts`
- [x] 2.2 In `serializeTask`, compute and include `allSubtasksDone = task.subtasks.every(s => s.status === 'DONE')` (true when no subtasks)
- [x] 2.3 Add `allSubtasksDone: z.boolean()` to `TaskSchema` in `backend/src/schemas/task.ts`

## 3. Backend: Done guard on status update

- [x] 3.1 In `updateTaskStatus` (`backend/src/services/tasks.ts`), when the new status is `DONE`, load the task's direct subtasks' statuses and throw `conflict(...)` if any is not `DONE`, leaving the status unchanged
- [x] 3.2 Add a `409` response to the `PATCH /api/tasks/{id}/status` path in `backend/src/openapi.ts`
- [x] 3.3 Build the backend (`npm run build`) and resolve type errors

## 4. Frontend: API client

- [x] 4.1 Add `allSubtasksDone: boolean` to the `Task` type and `parentId?: string` to `CreateTaskInput` in `frontend/src/lib/api.ts`

## 5. Frontend: task list (root-only + disable Done)

- [x] 5.1 In `frontend/src/pages/TaskListPage.tsx`, render only root tasks (`parentId === null`); keep loading/empty/error states based on the filtered set
- [x] 5.2 Disable the "Done" `<option>` in a row's status control when that task's `allSubtasksDone` is `false`; add a brief accessible explanation

## 6. Frontend: CreateTask component

- [x] 6.1 Create `frontend/src/components/CreateTask.tsx` — a controlled, recursive component rendering one draft node's title input + optional skills `<fieldset>`, its indented children (each a `CreateTask`), an "Add subtask" button, and a "Remove" button for non-root nodes; accessible names/ids per node
- [x] 6.2 Move the skills fetch to the page and pass the skills list down; keep per-block title validation (`aria-invalid`/`aria-describedby`) and the keyboard-operable structure

## 7. Frontend: wire CreateTask into the page + tree submit

- [x] 7.1 Refactor `frontend/src/pages/TaskCreatePage.tsx` to hold the draft tree state (root `DraftNode` + skills) and render the root `CreateTask`
- [x] 7.2 On submit: validate every node has a title (focus first invalid, block otherwise), then create top-down — `POST` root, then each child with `parentId` = parent's returned id, recursively
- [x] 7.3 On full success navigate to `/tasks`; on failure show a `role="alert"` error via `toErrorMessage` and preserve all entered values

## 8. Verification

- [x] 8.1 Run frontend `npm run build` and `npm run lint`; run backend `npm run build`
- [x] 8.2 Backend: create a parent + subtask; `GET /api/tasks` shows `allSubtasksDone=false` for the parent; setting the parent to `DONE` returns `409`; mark the subtask `DONE`, then parent → `DONE` returns `200`; a task with no subtasks has `allSubtasksDone=true`
- [x] 8.3 Frontend: build a root task with nested subtasks in the form and submit; confirm the tree is created with correct `parentId` links (via `GET /api/tasks`) and the list shows only the root
- [x] 8.4 Frontend: a root with an unfinished subtask has its "Done" option disabled; after the subtask is `DONE`, "Done" becomes selectable and the update succeeds
- [x] 8.5 Accessibility: per-block title validation announces and focuses; add/remove subtask works by keyboard; run a Lighthouse/axe check on `/tasks/new` and `/tasks`
- [x] 8.6 Verify tree-create failure path shows an accessible error and preserves input
