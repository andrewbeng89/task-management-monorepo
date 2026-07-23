## RENAMED Requirements

- FROM: `### Requirement: Task creation placeholder page`
- TO: `### Requirement: Task creation form`

## MODIFIED Requirements

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
