# e2e-testing Specification

## Purpose

Provide an automated, browser-based end-to-end test suite (Playwright) that verifies the core task-management journeys of the application through a real browser. The suite runs against the containerized build, resets and seeds the database to a deterministic baseline, and is executable via documented, repo-level scripts so runs are repeatable and reproducible.

## Requirements

### Requirement: Browser-based end-to-end test suite

The project SHALL provide an automated end-to-end test suite, written with Playwright, that drives the running application through a real browser against the frontend's served URL. The suite SHALL cover the core task-management journeys defined in the `task-web-ui` capability: viewing the task list, creating a task, creating a nested subtask tree, updating a task's status, and assigning a developer.

#### Scenario: Suite runs against the served application

- **WHEN** the e2e suite is executed with the application running
- **THEN** each test navigates to the frontend's base URL and interacts only through the browser UI (no direct database or API calls to perform user actions)
- **AND** the suite reports a pass/fail result per test

#### Scenario: View the seeded task list

- **WHEN** a test opens the task list page after the database has been reset and seeded
- **THEN** the task list page renders inside the app layout with the Title, Skills, Status, and Assignee columns and shows the empty-state message (no data rows) since seeding creates no tasks

#### Scenario: Create a single task through the UI

- **WHEN** a test enters a title on the task creation page and submits the form using the UI
- **THEN** the app navigates to the task list and the newly created task appears as a row with its title and a default status

#### Scenario: Create a nested subtask tree through the UI

- **WHEN** a test uses "Add subtask" to add a nested block, fills in the parent and subtask titles, and submits
- **THEN** the task list shows the subtask rendered beneath and indented relative to its parent

#### Scenario: Update a task's status through the UI

- **WHEN** a test changes a task's status control to a different status
- **THEN** the row reflects the new human-readable status label

#### Scenario: Assign a developer through the UI

- **WHEN** a test opens a task's assignee control and selects a candidate developer
- **THEN** the row reflects the selected developer as the assignee

### Requirement: Runs against the containerized build

The e2e suite SHALL be runnable against the containerized build of the application (Postgres, backend, and frontend orchestrated by Docker Compose), targeting the frontend served by the container. The workflow SHALL bring the stack up, wait until the application is ready, run the tests, and allow the stack to be torn down.

#### Scenario: Execute against the Docker Compose stack

- **WHEN** the containerized stack is started and healthy
- **THEN** the e2e suite targets the container-served frontend base URL and runs to completion

#### Scenario: Wait for readiness before running

- **WHEN** the e2e workflow starts the stack
- **THEN** it waits for the frontend and backend to be reachable/healthy before executing any test, rather than failing on a not-yet-ready service

### Requirement: Deterministic database reset and seed fixture

The e2e workflow SHALL reset and seed the database to a known baseline (the seeded skills and developers, with no tasks) before tests that depend on that baseline, so runs are deterministic and repeatable.

#### Scenario: Reset and seed before dependent tests

- **WHEN** the e2e workflow prepares to run tests that assume the seeded baseline
- **THEN** the database is reset (all task data cleared) and re-seeded with the default skills and developers before those tests execute

#### Scenario: Repeatable runs

- **WHEN** the e2e suite is run more than once in succession
- **THEN** each run starts from the same seeded baseline and produces the same results, independent of data left over from a prior run

### Requirement: Documented and script-driven execution

The project SHALL expose a documented way to run the e2e suite via repo-level scripts, including any environment prerequisites, so a developer can run the suite with a single documented command flow.

#### Scenario: Run the suite from documented scripts

- **WHEN** a developer follows the documented e2e instructions
- **THEN** repo-level scripts start the containerized stack, reset and seed the database, and run the Playwright suite
