## Context

`TaskListPage` fetches `GET /api/tasks` once on mount and, on a status/assignee mutation, calls `replaceTask(updated)` — which swaps only the mutated task in local state using the API's returned DTO. `allSubtasksDone` is computed server-side per task, so when a subtask is completed, its parent's `allSubtasksDone` changes on the server but the parent's already-rendered row keeps its stale value (and thus its disabled "Done" option) until a full reload. The list now shows all tasks (roots + subtasks), so this staleness is visible and blocks the natural "finish subtasks → complete parent" flow.

## Goals / Non-Goals

**Goals:**
- After a subtask's status update succeeds, reflect the resulting ancestor completion state (enable a parent's "Done" once all its subtasks are done) without a manual reload.
- Keep the interaction responsive and the table stable during the refresh.

**Non-Goals:**
- No client-side recomputation of `allSubtasksDone` (server remains the source of truth).
- No caching library / websockets / polling.
- No backend change.
- No refresh for root-task status changes or assignee changes (they don't affect any ancestor's completion state).

## Decisions

### Re-fetch the list after a subtask status update
In `handleStatusChange`, after the `PATCH …/status` succeeds and the row is updated (`replaceTask` for immediate feedback + announcement), if the updated task has a `parentId`, call `listTasks()` again and replace the rendered tasks. Re-fetching is the simplest correct way to refresh every ancestor's server-computed `allSubtasksDone` (a parent, grandparent, etc.), rather than trying to recompute derived state on the client.

*Scope to subtasks:* only tasks with a `parentId` can change an ancestor's completion state, so the refresh is gated on `task.parentId !== null`. Root status changes and all assignee changes keep the existing lightweight in-row update.

*Alternative considered:* client-side recomputation of ancestors' `allSubtasksDone` from local state — rejected; it duplicates backend logic (direct-children rule) and risks drift. A re-fetch is one cheap request and always correct.

### Refresh without disrupting the view
The refresh must not flip the page back to the `loading` state (that would blank the table). Instead, on refresh success replace `load.tasks` in place (staying in `loaded`); keep `assigneeOptions` and other state untouched. Guard against unmounted updates.

### Failure handling
The primary mutation already reported success and updated the row optimistically. If the background re-fetch fails, keep the current (already-updated) state and do not surface a blocking error for the refresh itself — the user can reload to reconcile. (The existing `role="alert"` handling still covers the mutation itself.)

### Concurrency
The row is disabled while its mutation is in flight (`busy`), preventing overlapping updates on the same row. The refresh runs after the mutation resolves. If multiple subtasks are updated in quick succession across rows, each triggers a refresh; the last resolved response wins — acceptable, since all reflect server truth.

## Risks / Trade-offs

- **Extra request per subtask status change** → one `GET /api/tasks`; negligible at MVP scale. A future cache/incremental update could avoid the full fetch.
- **Brief window where parent row is stale** (between mutation success and refresh completion) → acceptable; the row isn't blanked and the refresh is fast.
- **Refresh races with an in-flight mutation on another row** → the mutating row is guarded by `busy`; a refresh replacing tasks won't drop that row's pending request, and the next render reflects server state.

## Open Questions

- Should assignee changes also trigger a refresh? Not needed — assignment doesn't affect `allSubtasksDone`. Left out to keep requests minimal.
