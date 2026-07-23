## ADDED Requirements

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
