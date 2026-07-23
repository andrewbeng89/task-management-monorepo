## MODIFIED Requirements

### Requirement: Retrieve tasks

The API SHALL provide `GET /api/tasks` to list tasks and `GET /api/tasks/:id` to fetch a single task. Task representations SHALL include `id`, `title`, `status`, the assignee (if any), the task's required skills, and `allSubtasksDone` — a boolean that is `true` when every one of the task's direct subtasks has status `DONE`, and `true` when the task has no subtasks.

#### Scenario: List all tasks

- **WHEN** a client sends `GET /api/tasks`
- **THEN** the API returns `200` with an array of tasks, each including its status, assignee, required skills, and `allSubtasksDone`

#### Scenario: Fetch a task by id

- **WHEN** a client sends `GET /api/tasks/:id` for an existing task
- **THEN** the API returns `200` with that task's full representation, including `allSubtasksDone`

#### Scenario: allSubtasksDone reflects subtask completion

- **WHEN** a client retrieves a task that has subtasks
- **THEN** `allSubtasksDone` is `true` only if every direct subtask has status `DONE`, and `false` otherwise
- **AND** a task with no subtasks has `allSubtasksDone` equal to `true`

#### Scenario: Fetch a non-existent task

- **WHEN** a client sends `GET /api/tasks/:id` for an id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error

### Requirement: Update a task's status

The API SHALL provide an endpoint to update a task's status to one of `TODO`, `IN_PROGRESS`, or `DONE`. Setting a task to `DONE` SHALL be permitted only when all of the task's direct subtasks are already `DONE`; otherwise the API SHALL reject the update and leave the status unchanged.

#### Scenario: Update to a valid status

- **WHEN** a client updates an existing task's status to `IN_PROGRESS`
- **THEN** the API returns `200` with the task reflecting the new status

#### Scenario: Complete a task whose subtasks are all done

- **WHEN** a client sets a task to `DONE` and every direct subtask is already `DONE` (or it has no subtasks)
- **THEN** the API returns `200` with the task reflecting status `DONE`

#### Scenario: Reject completing a task with unfinished subtasks

- **WHEN** a client sets a task to `DONE` while at least one direct subtask is not `DONE`
- **THEN** the API returns `409 Conflict` with a JSON error and does not change the status

#### Scenario: Reject an invalid status value

- **WHEN** a client updates a task's status to a value outside the allowed set
- **THEN** the API returns `400 Bad Request` with a JSON error and does not change the status

#### Scenario: Update status of a non-existent task

- **WHEN** a client updates the status of a task id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error
