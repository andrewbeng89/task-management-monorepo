## 1. API client

- [x] 1.1 Add a `Developer` type to `frontend/src/lib/api.ts` (`id`, `name`, `createdAt`, `updatedAt`, `skills`)
- [x] 1.2 Add `listTasks(): Promise<Task[]>` (`GET tasks`)
- [x] 1.3 Add `updateTaskStatus(id, status): Promise<Task>` (`PATCH tasks/:id/status` with `{ status }`)
- [x] 1.4 Add `listTaskAssignees(id): Promise<Developer[]>` (`GET tasks/:id/assignees`)
- [x] 1.5 Add `assignTask(id, developerId): Promise<Task>` (`PATCH tasks/:id/assignee` with `{ developerId }`)

## 2. Status labels & shared helpers

- [x] 2.1 Add a single status-label map (`TODO → "To do"`, `IN_PROGRESS → "In progress"`, `DONE → "Done"`) used by both the status `<select>` options and any read-only display

## 3. Task list table

- [x] 3.1 Replace the placeholder in `frontend/src/pages/TaskListPage.tsx` with data fetching via `listTasks()` on mount, keeping the heading and "New task" link
- [x] 3.2 Render accessible loading, empty (no rows + create link), and load-error states
- [x] 3.3 Render an accessible `<table>`: caption/aria label, `<thead>` with `<th scope="col">` for Title, Skills, Status, Assignee; Title as `<th scope="row">`
- [x] 3.4 Skills cell: read-only display of the task's required skills (no edit control)

## 4. Status control

- [x] 4.1 Render a status `<select>` per row with human-readable option labels and an `aria-label` naming the field and task; value bound to the task's status
- [x] 4.2 On change, call `updateTaskStatus`, update that row from the response, disable the control while in flight, and announce success / handle errors

## 5. Assignee control

- [x] 5.1 Render an assignee `<select>` per row with an `aria-label` naming the field and task; show the current assignee (or a placeholder when unassigned)
- [x] 5.2 Lazily load candidates via `listTaskAssignees(id)` on first interaction (focus/open); show a transient loading option; compose options as current assignee + fetched candidates
- [x] 5.3 On selecting a developer, call `assignTask`, update the row from the response, disable while in flight, and announce success / handle errors

## 6. Announcements & errors

- [x] 6.1 Add a visually-hidden `aria-live="polite"` region for successful updates and a `role="alert"` region for failures, using `toErrorMessage`

## 7. Verification

- [x] 7.1 Run frontend `npm run build` and `npm run lint`
- [x] 7.2 With backend + DB running and seeded, load `/tasks` and confirm all tasks render with Title, Skills, Status label, and Assignee
- [x] 7.3 Change a status and confirm `PATCH …/status` is sent and the row reflects the new label; change an assignee and confirm candidates come from `GET …/assignees` and `PATCH …/assignee` is sent
- [x] 7.4 Verify accessibility: table has column headers, each select has an accessible name, updates/errors are announced; run a Lighthouse/axe check on `/tasks`
- [x] 7.5 Verify empty and error states (no tasks; backend down)
