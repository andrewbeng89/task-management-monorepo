## 1. Ordering & grouping

- [x] 1.1 In `frontend/src/pages/TaskListPage.tsx`, remove the `parentId === null` filter so all fetched tasks are kept in state
- [x] 1.2 Add a helper that turns the flat task list into a depth-first ordered list of `{ task, depth }`: group children by `parentId`, walk each root (parent absent → treat as root) in `createdAt` order, emitting each task immediately before its descendants; preserve sibling order

## 2. Rendering

- [x] 2.1 Render one row per `{ task, depth }`; keep the single flat `<table>` and existing columns/controls
- [x] 2.2 Indent the Title `<th scope="row">` by `depth` (presentational left padding, with a modest per-level step)
- [x] 2.3 For subtask rows, add a visually-hidden relationship hint (e.g. "Subtask of \"{parent title}\":") in the Title cell so nesting is conveyed to assistive tech, not by indentation alone; optionally add a subtle visual indent cue
- [x] 2.4 Update the empty-state condition to reflect all tasks (empty only when there are no tasks at all)

## 3. Preserve existing behavior

- [x] 3.1 Confirm per-row status/assignee controls, the disabled "Done" option (`allSubtasksDone === false`), announcements, and error handling apply unchanged to every row including subtasks

## 4. Verification

- [x] 4.1 Run frontend `npm run build` and `npm run lint`
- [x] 4.2 With backend + DB running, seed a root with nested subtasks (and a deeper level); confirm the list shows all of them grouped under parents in depth-first order and indented by depth
- [x] 4.3 Verify the status rule on a subtask row: a subtask with an unfinished child has its "Done" option disabled; the backend still returns `409` if forced; after the child is done, "Done" becomes selectable and succeeds
- [x] 4.4 Accessibility: subtask rows expose their parent relationship to assistive tech; table headers and control names intact; run a Lighthouse/axe check on `/tasks`
- [x] 4.5 Verify status/assignee updates still work on both root and subtask rows and reflect in place
