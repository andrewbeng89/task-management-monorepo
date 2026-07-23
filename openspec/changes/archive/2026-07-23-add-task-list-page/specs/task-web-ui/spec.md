## RENAMED Requirements

- FROM: `### Requirement: Task list placeholder page`
- TO: `### Requirement: Task list page`

## MODIFIED Requirements

### Requirement: Task list page

The frontend SHALL provide a working task list page that fetches all tasks from `GET /api/tasks` and presents them in an accessible HTML `<table>` with the columns **Title**, **Skills**, **Status**, and **Assignee**. The Title and Skills cells SHALL be read-only. The Status cell SHALL allow changing the task's status, and the Assignee cell SHALL allow assigning a developer. Status values SHALL be shown as human-readable labels (for example "To do", "In progress", "Done"). The page SHALL communicate loading, empty, and error states accessibly, and SHALL keep a link to the task creation page.

#### Scenario: List tasks in a table

- **WHEN** a user opens the task list page
- **THEN** the frontend fetches tasks via `GET /api/tasks` and renders them in a table whose header row names the Title, Skills, Status, and Assignee columns
- **AND** each task row shows its title, its required skills, its current status as a human-readable label, and its current assignee (or an indication that it is unassigned)

#### Scenario: Accessible table structure and control names

- **WHEN** the task table is rendered
- **THEN** the table exposes column headers (`<th scope="col">`) and each interactive control has an accessible name that identifies both the field and the task it belongs to

#### Scenario: Empty state

- **WHEN** `GET /api/tasks` returns no tasks
- **THEN** the page shows an accessible empty-state message and the link to create a task, and renders no data rows

#### Scenario: Load error

- **WHEN** `GET /api/tasks` fails
- **THEN** the page shows an accessible error message instead of a table

#### Scenario: Update a task's status

- **WHEN** a user selects a different status from a row's status control
- **THEN** the frontend calls `PATCH /api/tasks/:id/status` for that task and, on success, reflects the new status label in that row

#### Scenario: Assign a developer to a task

- **WHEN** a user opens a row's assignee control
- **THEN** the frontend loads that task's candidate developers from `GET /api/tasks/:id/assignees`
- **AND** when the user selects a developer, the frontend calls `PATCH /api/tasks/:id/assignee` and, on success, reflects the new assignee in that row

#### Scenario: Skills are read-only

- **WHEN** a user views the Skills cell for a task
- **THEN** the cell displays the task's required skills and provides no control to edit them

#### Scenario: A control update fails

- **WHEN** a status or assignee update request fails
- **THEN** the frontend shows an accessible error (announced to assistive technology) and does not show the change as applied
