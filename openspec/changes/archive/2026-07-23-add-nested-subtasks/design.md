## Context

The Prisma schema already models nesting: `Task.parentId` with a self-relation `TaskToSubtasks` and `onDelete: Cascade` (deleting a parent removes its subtasks). `POST /api/tasks` already accepts an optional `parentId` (validated by `assertReferencesExist`), and the task DTO already returns `parentId`. So subtasks are creatable today; what's missing is (a) a completion signal in the API, (b) the `DONE` guard, and (c) UI to build and reason about subtasks. No schema/migration change is required.

Frontend state: React 19 + `ky`; `TaskCreatePage` currently holds the whole form inline; `TaskListPage` renders an accessible table with per-row status/assignee `<select>`s.

## Goals / Non-Goals

**Goals:**
- Add `allSubtasksDone` to task DTOs; enforce the `DONE`-requires-subtasks-done rule in `PATCH …/status`.
- Show only root tasks in the list; disable the "Done" option when `allSubtasksDone` is false.
- Extract a reusable `CreateTask` component; support building a nested subtask tree and creating it top-down.

**Non-Goals:**
- Showing subtasks in the list, or a dedicated subtask/detail view (root-only for now).
- Editing an existing task's subtasks, reparenting, or bulk operations.
- A transactional tree-create endpoint (out of scope; creation is client-orchestrated).
- Recursive/deep completion semantics beyond direct children (see decision).

## Decisions

### `allSubtasksDone` is computed over **direct** children
Define `allSubtasksDone = task.subtasks.every(s => s.status === 'DONE')`, which is `true` for a task with no subtasks. Direct children suffice transitively: a child can only be `DONE` if *its* children are `DONE` (same rule), so a parent whose direct children are all `DONE` has a fully-`DONE` subtree. Implementation: add `subtasks: { select: { status: true } }` to `taskInclude` so every task DTO can compute the flag in `serializeTask`. This flows to `GET /tasks`, `GET /tasks/:id`, and the DTOs returned by the mutation endpoints.

### `PATCH …/status` guard returns `409 Conflict`
In `updateTaskStatus`, when the requested status is `DONE`, load the task's direct subtask statuses and, if any is not `DONE`, throw `conflict(...)` (mirrors `assignTask`'s 409 for a business-rule violation) with a clear message; leave the status unchanged. Non-`DONE` transitions are unaffected. Register the `409` response for the status path in `openapi.ts`.

*Alternative considered:* `422` — rejected for consistency with the existing `conflict` usage.

### List shows root tasks by client-side filter
`GET /api/tasks` stays a full list (the `allSubtasksDone` flag is added for all tasks). The list page filters to `parentId === null` client-side. This avoids a new query parameter and keeps the endpoint general; the extra subtask rows discarded are acceptable at MVP scale.

*Alternative considered:* a `?root=true` server filter — deferred; not needed yet and would complicate the endpoint.

### Disable the "Done" option, not the whole control
In the status `<select>`, render the `Done` `<option disabled>` when the row task's `allSubtasksDone` is `false`. The user can still move between `To do`/`In progress`. The backend guard is the source of truth; the disabled option is the accessible front-line affordance. A short helper/tooltip text (visually and via the option) explains why.

### `CreateTask` component + recursive tree state
Extract the existing form (title input, optional skills fieldset, validation, error handling) into `components/CreateTask.tsx`. Model the form as a **tree of plain data nodes** owned at the page level:

```
type DraftNode = { key: string; title: string; skillIds: Set<string>; titleError: string|null; children: DraftNode[] }
```

`CreateTask` is a controlled, recursive component that renders one node's fields plus its children (each rendered by `CreateTask`, visually indented), an "Add subtask" button (appends a child node), and — for non-root nodes — a "Remove" button (prunes that node and its descendants). A stable `key` per node (a monotonic counter, since `Math.random`/`Date.now` are fine in app code) drives React keys and `id`/`aria` wiring. The skills list is fetched once at the page and passed down (avoids N fetches).

*Alternative considered:* each `CreateTask` owning its own child state via refs — rejected; a single page-owned tree makes submission and validation straightforward.

### Submission: validate all, then create top-down
On submit: walk the tree and validate every node has a non-empty title (mark node-level errors, focus the first invalid, block if any). Then create depth-first/pre-order: `POST` the root, take the returned `id`, then for each child `POST` with `parentId = createdParentId`, recursing. On full success, navigate to `/tasks`. On any failure, stop, show an accessible `role="alert"` error (via `toErrorMessage`), keep all entered values, and do not navigate. `CreateTaskInput` gains an optional `parentId`.

### Accessibility
- Each node's title input has a unique `id` and associated error via `aria-describedby`/`aria-invalid`; the skills group stays a `<fieldset>`/`<legend>`.
- Indentation is presentational (padding/margin); nesting relationships are conveyed by grouping each block in a labelled container (e.g. a `<fieldset>` or a region with an accessible name like "Subtask of …") so structure isn't conveyed by indentation alone.
- "Add subtask" / "Remove" are real `<button>`s with names that identify their target block; the whole form remains keyboard-operable and submittable via Enter/submit control.
- Errors announced through a `role="alert"` region; success announced or navigation occurs.

## Risks / Trade-offs

- **Non-transactional tree creation** → partial data if a mid-tree `POST` fails. Mitigation: pre-validate everything before any request; report the failure and keep the form; document that created-so-far tasks persist. A transactional endpoint is the future fix.
- **Deeply nested forms** → possible awkward UX / horizontal space. Mitigation: indentation via padding, allow but don't encourage extreme depth; no hard cap for now.
- **`allSubtasksDone` adds a subtasks join to every task query** → negligible at MVP scale (`select: { status: true }` only).
- **Client-side root filtering fetches subtasks unnecessarily** → acceptable now; revisit with a server filter if lists grow.

## Open Questions

- Should the list later show subtasks nested under their parent (expandable rows)? Out of scope now; the root-only filter is a deliberate interim step.
