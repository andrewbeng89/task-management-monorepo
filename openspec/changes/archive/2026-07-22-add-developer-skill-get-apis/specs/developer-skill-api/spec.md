## ADDED Requirements

### Requirement: Retrieve a developer by id

The API SHALL provide `GET /api/developers/:id` that returns the developer's own fields and its downstream relationships only: `id`, `name`, `createdAt`, `updatedAt`, and the developer's skills (each `{ id, name }`). It SHALL NOT include tasks assigned to the developer, because those reference the developer (an upstream relationship). An unknown id SHALL return `404`.

#### Scenario: Fetch an existing developer

- **WHEN** a client sends `GET /api/developers/:id` for an existing developer
- **THEN** the API returns `200` with the developer's `id`, `name`, timestamps, and their skills

#### Scenario: Developer with skills

- **WHEN** a client fetches a developer who has skills
- **THEN** the response includes the list of that developer's skills

#### Scenario: Assigned tasks are excluded

- **WHEN** a client fetches a developer who has tasks assigned to them
- **THEN** the response does not include those tasks (they are an upstream relationship)

#### Scenario: Fetch a non-existent developer

- **WHEN** a client sends `GET /api/developers/:id` for an id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error

#### Scenario: Reject a malformed id

- **WHEN** a client sends `GET /api/developers/:id` with an id that is not a valid identifier
- **THEN** the API returns `400 Bad Request` with a JSON validation error

### Requirement: Retrieve a skill by id

The API SHALL provide `GET /api/skills/:id` that returns the skill's own fields only: `id`, `name`, and `createdAt`. It SHALL NOT include developers who have the skill or tasks that require it, because those reference the skill (upstream relationships) and a skill has no downstream relationships. An unknown id SHALL return `404`.

#### Scenario: Fetch an existing skill

- **WHEN** a client sends `GET /api/skills/:id` for an existing skill
- **THEN** the API returns `200` with the skill's `id`, `name`, and `createdAt`

#### Scenario: Referencing entities are excluded

- **WHEN** a client fetches a skill that developers have and that tasks require
- **THEN** the response does not include those developers or tasks (they are upstream relationships)

#### Scenario: Fetch a non-existent skill

- **WHEN** a client sends `GET /api/skills/:id` for an id that does not exist
- **THEN** the API returns `404 Not Found` with a JSON error

#### Scenario: Reject a malformed id

- **WHEN** a client sends `GET /api/skills/:id` with an id that is not a valid identifier
- **THEN** the API returns `400 Bad Request` with a JSON validation error

### Requirement: Consistent error responses

The developer and skill endpoints SHALL return errors as JSON with the same shape used by the rest of the API (an `error` message, plus `details` for validation failures).

#### Scenario: Error responses are JSON

- **WHEN** a developer or skill endpoint returns an error
- **THEN** the response `Content-Type` is `application/json` and the body follows the shared error shape
