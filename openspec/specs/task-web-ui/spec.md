# task-web-ui Specification

## Purpose

Provide a navigable frontend app shell for the task management MVP: client-side routing, a shared responsive layout, and accessible placeholder pages for viewing the task list and creating a task. Business logic (data fetching, mutations, form handling, validation) is out of scope and layered in by later changes against this stable, accessible, responsive baseline.

## Requirements

### Requirement: Client-side routing

The frontend SHALL provide client-side routing so that task pages are reachable at distinct URLs without a full page reload.

#### Scenario: Navigating to the task list route

- **WHEN** a user navigates to `/tasks`
- **THEN** the task list page renders inside the shared app layout without a full page reload

#### Scenario: Navigating to the task creation route

- **WHEN** a user navigates to `/tasks/new`
- **THEN** the task creation page renders inside the shared app layout without a full page reload

#### Scenario: Default route redirect

- **WHEN** a user navigates to the root path `/`
- **THEN** the app redirects to the task list page at `/tasks`

#### Scenario: Unknown route

- **WHEN** a user navigates to a path that matches no defined route
- **THEN** a "not found" page renders inside the shared app layout with a link back to the task list

### Requirement: Shared responsive app layout

The frontend SHALL render all task pages inside a shared layout that provides consistent header, primary navigation, and a main content region, and that adapts to viewport width.

#### Scenario: Layout landmarks are present

- **WHEN** any task page renders
- **THEN** the page exposes a `banner` (header), a `navigation` region, and a single `main` landmark containing the page content

#### Scenario: Responsive navigation on small viewports

- **WHEN** the viewport width is at a mobile breakpoint
- **THEN** the layout remains usable with no horizontal overflow and navigation remains reachable

#### Scenario: Responsive layout on large viewports

- **WHEN** the viewport width is at a desktop breakpoint
- **THEN** content is constrained to a readable maximum width and does not stretch full-bleed

### Requirement: Accessible navigation and structure

The frontend SHALL meet baseline web accessibility standards for structure and keyboard operation across all task pages.

#### Scenario: Skip to main content

- **WHEN** a keyboard user focuses the first interactive element on the page
- **THEN** a "skip to main content" link is available that moves focus to the `main` region when activated

#### Scenario: Keyboard-operable navigation

- **WHEN** a user navigates the primary navigation using only the keyboard
- **THEN** each navigation link is focusable in a logical order and shows a visible focus indicator

#### Scenario: Single descriptive page heading

- **WHEN** any task page renders
- **THEN** the page has exactly one top-level `h1` that describes the page purpose

#### Scenario: Active navigation state is conveyed

- **WHEN** a navigation link corresponds to the current route
- **THEN** its active state is conveyed both visually and via `aria-current="page"`

#### Scenario: Color scheme preference is respected

- **WHEN** the user's system prefers a dark or light color scheme
- **THEN** the layout renders with sufficient contrast in that scheme

### Requirement: Task list page

The frontend SHALL provide a working task list page that fetches tasks from `GET /api/tasks` and presents **all** tasks — both root-level tasks and subtasks — in an accessible HTML `<table>` with the columns **Title**, **Skills**, **Status**, and **Assignee**. Tasks SHALL be grouped and ordered so that each subtask appears beneath its parent (depth-first order), with the Title cell visually indented according to nesting depth. The parent/child relationship SHALL be conveyed accessibly and not by indentation alone (for example, a screen-reader hint identifying a row as a subtask of its parent). The Title and Skills cells SHALL be read-only. The Status cell SHALL allow changing the task's status, and the Assignee cell SHALL allow assigning a developer. The "Done" status option SHALL be disabled for any task (root or subtask) whose `allSubtasksDone` is `false`. When a subtask's status changes, the page SHALL refresh the task list so that ancestor completion state (`allSubtasksDone`, and therefore whether a parent's "Done" option is enabled) reflects the change without requiring a manual reload. Status values SHALL be shown as human-readable labels (for example "To do", "In progress", "Done"). The page SHALL communicate loading, empty, and error states accessibly, and SHALL keep a link to the task creation page.

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

#### Scenario: Completing all subtasks enables the parent's Done option

- **WHEN** a user updates the last unfinished subtask of a parent to "Done" from the list
- **THEN** the page refreshes the task list and the parent's "Done" option becomes enabled without a manual reload

#### Scenario: Empty state

- **WHEN** `GET /api/tasks` returns no tasks
- **THEN** the page shows an accessible empty-state message and the link to create a task, and renders no data rows

#### Scenario: Load error

- **WHEN** `GET /api/tasks` fails
- **THEN** the page shows an accessible error message instead of a table

#### Scenario: Update a task's status

- **WHEN** a user selects a different status from a row's status control (for a root task or a subtask)
- **THEN** the frontend calls `PATCH /api/tasks/:id/status` for that task and, on success, reflects the new status label in that row
- **AND** if the updated task is a subtask, the frontend refreshes the task list so ancestor completion state is up to date

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
