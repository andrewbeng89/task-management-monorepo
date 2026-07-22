## ADDED Requirements

### Requirement: Create a task

The API SHALL provide `POST /api/tasks` to create a task. The request body MUST include a non-empty `title`. It MAY include `status` (one of `TODO`, `IN_PROGRESS`, `DONE`; defaults to `TODO`), `requiredSkillIds` (array of existing skill ids), and `parentId` (an existing task id). On success the API SHALL return `201 Created` with the created task, including its generated `id`.

#### Scenario: Create a task with only a title

- **WHEN** a client sends `POST /api/tasks` with `{ "title": "Build homepage" }`
- **THEN** the API creates the task with status `TODO` and returns `201` with the task's `id`, `title`, and `status`

#### Scenario: Create a task with required skills

- **WHEN** a client sends `POST /api/tasks` with a `title` and `requiredSkillIds` referencing existing skills
- **THEN** the API creates the task, links the required skills, and returns `201` with the task and its required skills

#### Scenario: Reject a task with a missing or empty title

- **WHEN** a client sends `POST /api/tasks` with no `title` or an empty `title`
- **THEN** the API returns `400 Bad Request` with a JSON error describing the invalid field and does not create a task

#### Scenario: Reject unknown referenced ids

- **WHEN** a client sends `POST /api/tasks` referencing a `parentId` or `requiredSkillIds` that do not exist
- **THEN** the API returns `400 Bad Request` (or `422`) with a JSON error and does not create a task

### Requirement: Retrieve tasks

The API SHALL provide `GET /api/tasks` to list tasks and `GET /api/tasks/:id` to fetch a single task. Task representations SHALL include `id`, `title`, `status`, the assignee (if any), and the task's required skills.

#### Scenario: List all tasks

- **WHEN** a client sends `GET /api/tasks`
- **THEN** the API returns `200` with an array of tasks, each including its status, assignee, and required skills

#### Scenario: Fetch a task by id

- **WHEN** a client sends `GET /api/tasks/:id` for an existing task
- **THEN** the API returns `200` with that task's full representation

#### Scenario: Fetch a non-existent task

- **WHEN** a client sends `GET /api/tasks/:id` for an id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error

### Requirement: Assign a task to a developer with a matching skill

The API SHALL provide an endpoint to assign a task to a developer. The assignment SHALL be permitted only when the developer possesses **at least one** of the skills the task requires. When the task requires no skills, any developer MAY be assigned.

#### Scenario: Assign to a developer sharing a required skill

- **WHEN** a client assigns a task requiring `Frontend` to a developer who has the `Frontend` skill
- **THEN** the API returns `200` with the task now showing that developer as its assignee

#### Scenario: Reject assignment when the developer lacks every required skill

- **WHEN** a client assigns a task requiring `Backend` to a developer who has only `Frontend`
- **THEN** the API returns `409 Conflict` (or `422`) with a JSON error explaining the skill mismatch and does not change the assignee

#### Scenario: Assign a task that requires no skills

- **WHEN** a client assigns a task with no required skills to any existing developer
- **THEN** the API returns `200` with that developer as the assignee

#### Scenario: Reject assignment to a non-existent developer or task

- **WHEN** a client assigns a non-existent task, or assigns to a non-existent developer
- **THEN** the API returns `404 Not Found` with a JSON error and makes no change

### Requirement: Update a task's status

The API SHALL provide an endpoint to update a task's status to one of `TODO`, `IN_PROGRESS`, or `DONE`.

#### Scenario: Update to a valid status

- **WHEN** a client updates an existing task's status to `IN_PROGRESS`
- **THEN** the API returns `200` with the task reflecting the new status

#### Scenario: Reject an invalid status value

- **WHEN** a client updates a task's status to a value outside the allowed set
- **THEN** the API returns `400 Bad Request` with a JSON error and does not change the status

#### Scenario: Update status of a non-existent task

- **WHEN** a client updates the status of a task id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error

### Requirement: Consistent validation and error responses

The API SHALL validate request bodies and parameters and return errors as JSON with a stable shape (e.g. an `error` message and, for validation failures, field-level detail). Client errors SHALL use `4xx` status codes and unexpected failures SHALL use `500`.

#### Scenario: Malformed JSON body

- **WHEN** a client sends a request with a malformed JSON body
- **THEN** the API returns `400 Bad Request` with a JSON error rather than crashing

#### Scenario: Error responses are JSON

- **WHEN** any endpoint returns an error
- **THEN** the response `Content-Type` is `application/json` and the body follows the documented error shape
