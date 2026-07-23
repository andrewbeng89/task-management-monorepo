## MODIFIED Requirements

### Requirement: Task list page

The frontend SHALL provide a working task list page that fetches tasks from `GET /api/tasks` and presents **all** tasks — both root-level tasks and subtasks — in an accessible HTML `<table>` with the columns **Title**, **Skills**, **Status**, and **Assignee**. Tasks SHALL be grouped and ordered so that each subtask appears beneath its parent (depth-first order), with the Title cell visually indented according to nesting depth. The parent/child relationship SHALL be conveyed accessibly and not by indentation alone (for example, a screen-reader hint identifying a row as a subtask of its parent). The Title and Skills cells SHALL be read-only. The Status cell SHALL allow changing the task's status, and the Assignee cell SHALL allow assigning a developer. The "Done" status option SHALL be disabled for any task (root or subtask) whose `allSubtasksDone` is `false`. Status values SHALL be shown as human-readable labels (for example "To do", "In progress", "Done"). The page SHALL communicate loading, empty, and error states accessibly, and SHALL keep a link to the task creation page.

#### Scenario: List tasks and subtasks in a table

- **WHEN** a user opens the task list page
- **THEN** the frontend fetches tasks via `GET /api/tasks` and renders every task — root tasks and subtasks — in a table whose header row names the Title, Skills, Status, and Assignee columns
- **AND** each task row shows its title, its required skills, its current status as a human-readable label, and its current assignee (or an indication that it is unassigned)

#### Scenario: Subtasks are grouped under and indented beneath their parent

- **WHEN** the fetched tasks include subtasks
- **THEN** each subtask is rendered immediately beneath its parent (depth-first) with its Title cell visually indented according to its nesting depth

#### Scenario: Nesting relationship is conveyed accessibly

- **WHEN** a subtask row is rendered
- **THEN** its relationship to its parent is available to assistive technology (not conveyed by indentation alone)

#### Scenario: Accessible table structure and control names

- **WHEN** the task table is rendered
- **THEN** the table exposes column headers (`<th scope="col">`) and each interactive control has an accessible name that identifies both the field and the task it belongs to

#### Scenario: Disable completing a task with unfinished subtasks

- **WHEN** a task's `allSubtasksDone` is `false` (whether it is a root task or a subtask)
- **THEN** the "Done" option in that row's status control is disabled and cannot be selected

#### Scenario: Empty state

- **WHEN** `GET /api/tasks` returns no tasks
- **THEN** the page shows an accessible empty-state message and the link to create a task, and renders no data rows

#### Scenario: Load error

- **WHEN** `GET /api/tasks` fails
- **THEN** the page shows an accessible error message instead of a table

#### Scenario: Update a task's status

- **WHEN** a user selects a different status from a row's status control (for a root task or a subtask)
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
