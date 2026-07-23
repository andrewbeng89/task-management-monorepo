## ADDED Requirements

### Requirement: List all skills

The API SHALL provide `GET /api/skills` that returns all skills as an array, each with its own fields only: `id`, `name`, and `createdAt`. Consistent with `GET /api/skills/:id`, the response SHALL NOT include developers who have the skill or tasks that require it (upstream relationships). When no skills exist, the API SHALL return an empty array.

#### Scenario: List skills

- **WHEN** a client sends `GET /api/skills`
- **THEN** the API returns `200` with an array of skills, each including `id`, `name`, and `createdAt`

#### Scenario: Referencing entities are excluded

- **WHEN** a client lists skills that developers have and that tasks require
- **THEN** each skill in the response includes only its own fields and omits those developers and tasks

#### Scenario: No skills exist

- **WHEN** a client sends `GET /api/skills` and no skills have been created
- **THEN** the API returns `200` with an empty array
