## Why

The task list currently hides subtasks — only root-level tasks are shown, so subtasks created via the nested creation form are invisible after creation. Users need to see and manage subtasks in context, grouped under their parent, while keeping the existing completion rules.

## What Changes

- Task list page: stop filtering to root-level tasks — display **all** tasks, including subtasks (`parentId !== null`).
- Group and order tasks so each subtask appears under its parent: render in depth-first order (each root followed by its descendants), with the Title cell visually **indented** by nesting depth.
- Convey the parent/child relationship accessibly (not by indentation alone) — e.g. a screen-reader hint identifying a row as a subtask of its parent.
- Keep the existing per-row status/assignee controls for every row, including subtasks.
- Verify the completion rule still applies to every row: the "Done" option remains disabled whenever a task's `allSubtasksDone` is `false` (the backend also enforces this via `PATCH /api/tasks/:id/status`). No new status logic is added — this change confirms it holds for subtask rows too.

## Capabilities

### New Capabilities
<!-- None. This extends the existing task-web-ui capability. -->

### Modified Capabilities
- `task-web-ui`: the task list page now shows subtasks alongside root tasks, grouped and ordered under their parents with accessible nesting, while retaining the existing status/assignee controls and the "Done" gating rule.

## Impact

- **Frontend**: `frontend/src/pages/TaskListPage.tsx` — remove the root-only filter, build a depth-first ordered list with depth, indent the Title cell, add an accessible subtask relationship hint.
- **Backend**: none — `GET /api/tasks` already returns all tasks with `parentId` and `allSubtasksDone`; the `DONE` guard is unchanged.
- **No new API calls or types.**
