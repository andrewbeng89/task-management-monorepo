## MODIFIED Requirements

### Requirement: Task list page

The frontend SHALL provide a working task list page that fetches tasks from `GET /api/tasks` and presents the **root-level tasks** (those with no parent) in an accessible HTML `<table>` with the columns **Title**, **Skills**, **Status**, and **Assignee**. The Title and Skills cells SHALL be read-only. The Status cell SHALL allow changing the task's status, and the Assignee cell SHALL allow assigning a developer. The "Done" status option SHALL be disabled for a task whose `allSubtasksDone` is `false`. Status values SHALL be shown as human-readable labels (for example "To do", "In progress", "Done"). The page SHALL communicate loading, empty, and error states accessibly, and SHALL keep a link to the task creation page.

#### Scenario: List root tasks in a table

- **WHEN** a user opens the task list page
- **THEN** the frontend fetches tasks via `GET /api/tasks` and renders the root-level tasks (no parent) in a table whose header row names the Title, Skills, Status, and Assignee columns
- **AND** each task row shows its title, its required skills, its current status as a human-readable label, and its current assignee (or an indication that it is unassigned)

#### Scenario: Subtasks are not shown in the list

- **WHEN** the fetched tasks include tasks that have a parent
- **THEN** those subtasks are not rendered as rows in the task list

#### Scenario: Accessible table structure and control names

- **WHEN** the task table is rendered
- **THEN** the table exposes column headers (`<th scope="col">`) and each interactive control has an accessible name that identifies both the field and the task it belongs to

#### Scenario: Disable completing a task with unfinished subtasks

- **WHEN** a task's `allSubtasksDone` is `false`
- **THEN** the "Done" option in that row's status control is disabled and cannot be selected

#### Scenario: Empty state

- **WHEN** `GET /api/tasks` returns no root-level tasks
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

### Requirement: Task creation form

The frontend SHALL provide a working task creation form on the task creation page, built from a reusable `CreateTask` component that uses a semantic HTML `<form>` and creates tasks via `POST /api/tasks`. Each `CreateTask` block SHALL require a `title` and MAY optionally specify skills; assigning a developer SHALL NOT be part of the form. A `CreateTask` block SHALL provide an "Add subtask" action that adds a nested `CreateTask` block beneath and visually indented to its parent, to arbitrary depth; added subtask blocks SHALL be removable. The form SHALL be fully operable and submittable using the keyboard alone. On submit the frontend SHALL create the task tree top-down (each subtask created with its parent's id), and on success SHALL navigate to the task list; on failure it SHALL surface an accessible error and preserve the user's input.

#### Scenario: Create a single task with a title using the keyboard only

- **WHEN** a user, using only the keyboard, enters a title in the root block and submits the form
- **THEN** the frontend sends `POST /api/tasks` with the entered title and, on success, navigates to the task list

#### Scenario: Title is required per block

- **WHEN** a user attempts to submit with any block's title empty or whitespace-only
- **THEN** the frontend prevents submission, shows an accessible validation message associated with that title field, and moves focus to it

#### Scenario: Optionally select skills

- **WHEN** a user selects one or more skills in a block before submitting
- **THEN** the frontend includes the selected skill ids for that task in its `POST /api/tasks` request

#### Scenario: Add nested subtasks

- **WHEN** a user activates "Add subtask" on a block
- **THEN** a new `CreateTask` block appears beneath and indented to that block, and the user can fill in its title and skills

#### Scenario: Remove an added subtask

- **WHEN** a user removes an added subtask block
- **THEN** that block and any of its own nested blocks are removed from the form and will not be created on submit

#### Scenario: Submit a task tree

- **WHEN** a user submits a root task that has one or more nested subtasks
- **THEN** the frontend creates the root first and then each subtask with its parent's id, so the created subtasks reference the correct parent

#### Scenario: No developer assignment on this form

- **WHEN** a user views the task creation form
- **THEN** the form provides no control for assigning a developer

#### Scenario: Error while creating the tree

- **WHEN** a `POST /api/tasks` request fails while creating the tree
- **THEN** the frontend shows an accessible error message and preserves the entered values (it does not navigate away)
