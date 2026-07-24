# task-api Specification

## Purpose

Provide a backend HTTP API for managing tasks: creating tasks, retrieving them, assigning tasks to developers whose skills match the task's requirements, and updating task status, with consistent validation and JSON error responses.

## Requirements

### Requirement: Create a task

The API SHALL provide `POST /api/tasks` to create a task. The request body MUST include a non-empty `title`. It MAY include `status` (one of `TODO`, `IN_PROGRESS`, `DONE`; defaults to `TODO`), `requiredSkillIds` (array of existing skill ids), and `parentId` (an existing task id). When `requiredSkillIds` is omitted or empty, the API SHALL attempt to infer the task's required skills from its `title` using the Gemini API, choosing only from the skills that exist in the `skills` table, and link any inferred skills to the created task. This inference SHALL be best-effort: if it is not configured, fails, or yields no usable skills, the task SHALL still be created with no required skills. When `requiredSkillIds` is provided, the API SHALL use exactly those skills and SHALL NOT infer. On success the API SHALL return `201 Created` with the created task, including its generated `id` and its required skills.

#### Scenario: Create a task with only a title

- **WHEN** a client sends `POST /api/tasks` with `{ "title": "Build homepage" }`
- **THEN** the API creates the task with status `TODO` and returns `201` with the task's `id`, `title`, and `status`

#### Scenario: Infer skills from the title when none are provided

- **WHEN** a client sends `POST /api/tasks` with a `title` and no `requiredSkillIds` (or an empty array), and skill inference is configured and available
- **THEN** the API infers required skills from the title, choosing only from skills that exist in the `skills` table, and returns `201` with those inferred skills linked to the task

#### Scenario: Inference is best-effort and never blocks creation

- **WHEN** a client sends `POST /api/tasks` without `requiredSkillIds` and inference is unavailable (no API key, empty skills table, or the Gemini call fails or returns nothing usable)
- **THEN** the API still returns `201` with the created task and no required skills, and does not return an error

#### Scenario: Provided skills are used as-is without inference

- **WHEN** a client sends `POST /api/tasks` with a `title` and a non-empty `requiredSkillIds` referencing existing skills
- **THEN** the API creates the task, links exactly those required skills (no inference is performed), and returns `201` with the task and its required skills

#### Scenario: Reject a task with a missing or empty title

- **WHEN** a client sends `POST /api/tasks` with no `title` or an empty `title`
- **THEN** the API returns `400 Bad Request` with a JSON error describing the invalid field and does not create a task

#### Scenario: Reject unknown referenced ids

- **WHEN** a client sends `POST /api/tasks` referencing a `parentId` or `requiredSkillIds` that do not exist
- **THEN** the API returns `400 Bad Request` (or `422`) with a JSON error and does not create a task

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

### Requirement: Consistent validation and error responses

The API SHALL validate request bodies and parameters and return errors as JSON with a stable shape (e.g. an `error` message and, for validation failures, field-level detail). Client errors SHALL use `4xx` status codes and unexpected failures SHALL use `500`.

#### Scenario: Malformed JSON body

- **WHEN** a client sends a request with a malformed JSON body
- **THEN** the API returns `400 Bad Request` with a JSON error rather than crashing

#### Scenario: Error responses are JSON

- **WHEN** any endpoint returns an error
- **THEN** the response `Content-Type` is `application/json` and the body follows the documented error shape

### Requirement: List candidate assignees for a task

The API SHALL provide `GET /api/tasks/:id/assignees` to list the developers eligible to be assigned to a task. A developer is a candidate when the developer possesses **at least one** of the task's required skills **and** is not the task's current assignee. When the task requires no skills, every developer is a candidate (still excluding the current assignee). Each returned developer SHALL include its `id`, `name`, and skills, consistent with the developer representation used elsewhere in the API.

#### Scenario: Return developers sharing at least one required skill

- **WHEN** a client sends `GET /api/tasks/:id/assignees` for a task requiring `Frontend`
- **THEN** the API returns `200` with an array containing every developer who has the `Frontend` skill and excluding developers who have none of the task's required skills

#### Scenario: Exclude the developer already assigned to the task

- **WHEN** a client sends `GET /api/tasks/:id/assignees` for a task that is currently assigned to a developer who also has a matching skill
- **THEN** the API returns `200` and the response does not include that currently-assigned developer

#### Scenario: A task requiring no skills returns all unassigned candidates

- **WHEN** a client sends `GET /api/tasks/:id/assignees` for a task that has no required skills
- **THEN** the API returns `200` with every developer except the task's current assignee

#### Scenario: No matching developers

- **WHEN** a client sends `GET /api/tasks/:id/assignees` for a task whose required skills are held by no other developer
- **THEN** the API returns `200` with an empty array

#### Scenario: Fetch assignees for a non-existent task

- **WHEN** a client sends `GET /api/tasks/:id/assignees` for a task id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error

#### Scenario: Reject an invalid task id

- **WHEN** a client sends `GET /api/tasks/:id/assignees` with an id that is not a valid identifier
- **THEN** the API returns `400 Bad Request` with a JSON error
