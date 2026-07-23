## Context

`TaskListPage` (shipped in `add-task-list-page`, extended in `add-nested-subtasks`) fetches `GET /api/tasks` and currently filters to `parentId === null` before rendering an accessible table with per-row status/assignee `<select>`s. Every task DTO already carries `parentId` and `allSubtasksDone`, and the "Done" option is already disabled per-row when `allSubtasksDone` is false. The backend enforces the same rule on `PATCH …/status` (409). So this change is purely a presentation change on the list page.

## Goals / Non-Goals

**Goals:**
- Show all tasks (roots + subtasks), grouped so each subtask sits beneath its parent, indented by depth.
- Convey nesting to assistive technology without relying on indentation alone.
- Preserve all existing per-row behavior (status/assignee controls, disabled "Done", announcements, error handling) for every row.

**Non-Goals:**
- Expand/collapse of subtree rows, drag-to-reparent, or a `treegrid` interaction model.
- Any backend change or new API/type.
- Changing the completion rule (only verifying it still applies to subtask rows).

## Decisions

### Build a depth-first ordered list with depth
Replace the `parentId === null` filter with an ordering step: group children by `parentId`, then walk from each root (a task whose parent is absent from the set) in `createdAt` order, emitting `{ task, depth }` pre-order (parent immediately followed by its descendants). Roots keep the API's `createdAt` ascending order; siblings preserve that order too.

*Defensive detail:* if a task's `parentId` refers to a task not present in the response, treat it as a root so it is never dropped (cascade delete makes true orphans unlikely, but the render must not lose rows).

*Alternative considered:* recursive nested `<tbody>`/nested tables — rejected; a single flat table with ordered rows keeps the existing structure and column semantics intact.

### Keep a single flat `<table>`; indent the Title cell
Rows stay in one `<tbody>` in computed order. The Title `<th scope="row">` gets left padding proportional to `depth` (e.g. `paddingLeft: base + depth * step`). Indentation is presentational only.

### Convey nesting accessibly (not by indentation alone)
Add a screen-reader-only hint in the Title cell for subtask rows, e.g. a visually-hidden "Subtask of \"{parentTitle}\": " before the title, so AT users understand the relationship. The parent title is looked up from the task set by `parentId`. (Column headers and the row header already provide table semantics; this adds the missing hierarchy cue.) A small visual affordance (e.g. a subtle "↳" or indent guide) may accompany it but is not the sole signal.

### Status logic is unchanged — verified, not modified
Each row already computes the disabled "Done" option from `task.allSubtasksDone`; because subtasks are now their own rows, the same expression applies to them automatically. No code change to the status handler; the change adds tests/verification that a subtask which itself has unfinished children cannot be set to "Done", and that the backend 409 still guards it.

### Empty state now reflects all tasks
With no filter, the empty state triggers only when there are truly no tasks. The existing loading/error/empty structure is otherwise unchanged.

## Risks / Trade-offs

- **Deep nesting → wide indentation on small screens** → the table already scrolls horizontally (`overflow-x-auto`); cap the visual indent step modestly so titles stay readable.
- **Accessibility of hierarchy in a flat table** → mitigated by the screen-reader relationship hint; a full `treegrid` is heavier than needed and out of scope.
- **Ordering correctness with many tasks** → the grouping is O(n); stable and based on `createdAt` ordering already returned by the API.

## Open Questions

- Should subtree rows be collapsible later? Out of scope now; the depth-first indented view is the interim step.
