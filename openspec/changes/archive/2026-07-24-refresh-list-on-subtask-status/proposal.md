## Why

On the task list page, marking every subtask of a parent as "Done" does not immediately let the parent be completed: the row updates only the mutated task from the API response, so the parent's `allSubtasksDone` stays stale and its "Done" option remains disabled until a manual page reload. Users expect to complete the parent right after finishing its subtasks.

## What Changes

- After a **subtask's** status is successfully updated on the list page, refresh the task list (re-fetch `GET /api/tasks`) so derived completion state — each ancestor's `allSubtasksDone`, and therefore whether the parent's "Done" option is enabled — reflects the change without a manual reload.
- Keep the immediate in-row update for responsiveness; the refresh reconciles ancestor rows.
- Refresh without disrupting the view: do not blank the table into a loading state, and preserve any accessible error/announcement behavior. A background refresh failure leaves the already-applied row change in place.
- **Feasibility:** confirmed feasible and cheap — one additional `GET /api/tasks` after a subtask status change; no backend or API change.

## Capabilities

### New Capabilities
<!-- None. This extends the existing task-web-ui capability. -->

### Modified Capabilities
- `task-web-ui`: the task list page refreshes derived completion state after a subtask's status changes, so a parent becomes completable once all its subtasks are done — without a manual reload.

## Impact

- **Frontend**: `frontend/src/pages/TaskListPage.tsx` — after a successful status update on a task that has a parent, re-fetch the task list and replace the rendered tasks.
- **Backend**: none — `GET /api/tasks` already returns fresh `allSubtasksDone` for every task.
- **Trade-off**: one extra `GET /api/tasks` per subtask status change (acceptable at MVP scale; a future cache layer could make this incremental).
