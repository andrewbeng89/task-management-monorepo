## Context

`/tasks` currently renders a placeholder (from `add-task-page-routes`). The backend provides everything this page needs: `GET /api/tasks` (returns tasks with `assignee` and `requiredSkills`), `PATCH /api/tasks/:id/status` (`{ status }` → updated task), `GET /api/tasks/:id/assignees` (skill-matched developers **excluding** the current assignee), and `PATCH /api/tasks/:id/assignee` (`{ developerId }` → updated task). The frontend uses `ky` (react-query was removed in `add-task-creation-form`); `frontend/src/lib/api.ts` already has `Task`/`Skill` types and a client.

## Goals / Non-Goals

**Goals:**
- Fetch and display all tasks in an accessible `<table>` (Title | Skills | Status | Assignee) with loading/empty/error states.
- Inline status change via a `<select>` → `PATCH …/status`, with human-readable labels.
- Inline assignee change via a `<select>` populated from `GET …/assignees` → `PATCH …/assignee`.
- Accessible names for every control; announce updates and errors.

**Non-Goals:**
- Editing a task's title or **skills** (read-only cells).
- Unassigning a developer (no API for it).
- Pagination, sorting, filtering, subtasks, row selection.
- Reintroducing react-query (stay with `ky` + local state).

## Decisions

### Data fetching: `ky` + local component state
Fetch tasks in a `useEffect` on mount and hold them in state; there is no shared cache to justify react-query for one screen. Status/assignee mutations use the **updated task returned by the API** to replace that row in state (server-authoritative), avoiding guesswork about derived fields.

### Human-readable status labels
Map the enum to labels in one place: `TODO → "To do"`, `IN_PROGRESS → "In progress"`, `DONE → "Done"`. The `<select>` `value` stays the enum; only the option text is friendly. Reused for the read-only display too.

### Assignee candidates are loaded lazily, per row
`GET /api/tasks/:id/assignees` is one request per task, so fetching for every row on page load is wasteful. Load a row's candidates on first interaction with its assignee control (focus/open), showing a transient "Loading…" option. This keeps initial load to a single `GET /api/tasks`.

*Alternative considered:* eager fetch for all rows — rejected (N extra requests, most never used).

### Assignee `<select>` composition
The candidates endpoint **excludes the current assignee**. So the options are: the current assignee (if any) rendered as the selected option, plus the fetched candidates. Because there is no unassign API, there is no empty/"Unassigned" choice that clears an assignee — a task with no assignee shows a placeholder "Select developer…" option that is non-selectable once a real choice is made. Selecting a candidate calls `PATCH …/assignee` with `developerId`.

### Accessibility
- Semantic `<table>` with a caption/`aria` label, `<thead>` `<th scope="col">`, and the Title cell as `<th scope="row">`.
- Each `<select>` has an `aria-label` naming field + task, e.g. `Status for "Build homepage"`, `Assignee for "Build homepage"` (no visible per-cell label exists).
- A visually-hidden `aria-live="polite"` region announces successful updates ("Status updated to In progress"); a `role="alert"` region announces failures.
- Controls are disabled while their request is in flight to prevent overlapping mutations on the same row.
- Responsive: allow horizontal scroll of the table on small screens without breaking semantics.

### Error handling
Reuse `toErrorMessage` from `lib/api.ts`. A failed load replaces the table with an error message. A failed mutation announces the error and leaves the row unchanged (no optimistic state to roll back, since rows update from the response).

## Risks / Trade-offs

- **Per-row assignee requests** → mitigated by lazy loading; note the tradeoff of a slight delay when opening the control.
- **Native `<select>` for assignee** → simple and accessible, but can't show rich info (e.g. matched skills). Acceptable for the MVP; a combobox could come later.
- **No unassign** → documented; the control only assigns/reassigns. If product wants unassign, it needs a backend change.
- **Stale rows if data changes elsewhere** → acceptable without a cache; a manual refresh/reload reflects server state.

## Open Questions

- Should completed (`DONE`) tasks visually de-emphasize? Assumed no styling special-casing for the MVP.
