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

### Requirement: Task list placeholder page

The frontend SHALL provide a placeholder task list page that establishes layout and accessibility scaffolding without implementing data fetching or business logic.

#### Scenario: Task list page renders scaffolding

- **WHEN** a user views the task list page
- **THEN** the page shows a page heading, a placeholder region where the task list will appear, and a link to the task creation page
- **AND** no task data is fetched from the backend

### Requirement: Task creation form

The frontend SHALL provide a working task creation form on the task creation page, built with a semantic HTML `<form>` element that submits to `POST /api/tasks`. The task `title` SHALL be the only required field. Specifying one or more skills SHALL be optional. Assigning a developer SHALL NOT be part of this form. The form SHALL be fully operable and submittable using the keyboard alone. On successful creation the frontend SHALL navigate to the task list; on failure it SHALL surface an accessible error and preserve the user's input.

#### Scenario: Submit with a title using the keyboard only

- **WHEN** a user, using only the keyboard, focuses the title field, types a title, and submits the form (via Enter or by activating the submit control)
- **THEN** the frontend sends `POST /api/tasks` with the entered title and, on `201`, navigates to the task list

#### Scenario: Title is required

- **WHEN** a user attempts to submit the form with an empty or whitespace-only title
- **THEN** the frontend prevents submission, shows an accessible validation message associated with the title field, and moves focus to that field

#### Scenario: Optionally select skills

- **WHEN** a user selects one or more skills from the available skills before submitting
- **THEN** the frontend includes the selected skill ids in the `POST /api/tasks` request as the task's required skills

#### Scenario: Submit without selecting any skill

- **WHEN** a user submits the form having selected no skills
- **THEN** the frontend creates the task with a title and no required skills

#### Scenario: No developer assignment on this form

- **WHEN** a user views the task creation form
- **THEN** the form provides no control for assigning a developer

#### Scenario: Server or network error on submit

- **WHEN** the `POST /api/tasks` request fails (validation, server, or network error)
- **THEN** the frontend shows an accessible error message (announced to assistive technology) and preserves the values the user already entered
