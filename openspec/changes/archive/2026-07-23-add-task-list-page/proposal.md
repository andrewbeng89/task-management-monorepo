## Why

The task list page is currently an accessible placeholder — it fetches nothing and shows a "list will appear here" box. Now that the backend exposes task listing, status updates, and candidate-assignee lookup, we can make the page functional: view all tasks and manage each task's status and assignee inline.

## What Changes

- Replace the placeholder `/tasks` page with a working list that fetches all tasks via `GET /api/tasks` on load, with loading, empty, and error states.
- Render tasks in an accessible HTML `<table>` with columns **Title | Skills | Status | Assignee**.
- **Title** cell: displays the task title (read-only).
- **Skills** cell: displays the task's required skills (read-only — editing a task's skills is out of scope).
- **Status** cell: a `<select>` (options shown as human-readable labels — "To do", "In progress", "Done") that updates the task via `PATCH /api/tasks/:id/status` on change.
- **Assignee** cell: a `<select>` whose candidate options are fetched from `GET /api/tasks/:id/assignees`; choosing a developer assigns them via `PATCH /api/tasks/:id/assignee`.
- Extend the frontend `ky` API client with `listTasks`, `updateTaskStatus`, `listTaskAssignees`, and `assignTask` (assignee) helpers and a `Developer` type.
- Each interactive control has an accessible name tied to its task; status/assignee changes are announced to assistive technology, and failures surface an accessible error without losing the current view.

## Capabilities

### New Capabilities
<!-- None. This extends the existing task-web-ui capability. -->

### Modified Capabilities
- `task-web-ui`: The task list page changes from an accessible placeholder to a working, accessible table that lists tasks and supports inline status updates and developer assignment.

## Impact

- **Frontend**: `frontend/src/pages/TaskListPage.tsx` (real table), `frontend/src/lib/api.ts` (new helpers + `Developer` type), possibly small row/select components.
- **Backend**: none — reuses existing `GET /api/tasks`, `PATCH /api/tasks/:id/status`, `GET /api/tasks/:id/assignees`, and `PATCH /api/tasks/:id/assignee`.
- **Out of scope**: editing a task's skills (no in-scope UI or API use), and unassigning a developer (there is no "unassign" API — the assignee control assigns/reassigns only).
